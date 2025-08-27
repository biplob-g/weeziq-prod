import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { client } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Upload API called");

    const user = await currentUser();
    if (!user) {
      console.log("❌ User not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ User authenticated:", user.id);

    const formData = await request.formData();

    const fileData = formData.get("file");
    const domainId = formData.get("domainId") as string;

    console.log("📁 File data type:", typeof fileData);
    console.log("📁 File data:", fileData ? "present" : "missing");
    console.log("🏠 Domain ID:", domainId);

    if (!fileData || !domainId) {
      return NextResponse.json(
        { error: "File and domainId are required" },
        { status: 400 }
      );
    }

    // Handle file data properly for Next.js API routes
    let fileName: string;
    let fileSize: number;
    let _fileBuffer: Buffer;

    try {
      console.log("🔧 Processing file data...");
      console.log("📄 File data type:", typeof fileData);
      console.log("📄 File data constructor:", fileData?.constructor?.name);

      // In Next.js API routes, FormData files are not standard File objects
      // They are special objects with different properties
      if (fileData && typeof fileData === "object") {
        const fileObj = fileData as unknown as {
          name?: string;
          filename?: string;
          size?: number;
          arrayBuffer?: () => Promise<ArrayBuffer>;
          stream?: () => ReadableStream;
          _buf?: Buffer;
          buffer?: ArrayBuffer;
        };

        // Get file name - try different possible properties
        fileName = fileObj.name || fileObj.filename || "unknown";
        fileSize = fileObj.size || 0;

        console.log("📄 File object properties:", Object.keys(fileObj));
        console.log("📄 File name:", fileName);
        console.log("📄 File size:", fileSize);

        // Try to get the file buffer
        if (fileObj.arrayBuffer) {
          console.log("📄 Using arrayBuffer method");
          const bytes = await fileObj.arrayBuffer();
          _fileBuffer = Buffer.from(bytes);
        } else if (fileObj.stream) {
          console.log("📄 Using stream method");
          const chunks: Uint8Array[] = [];
          const reader = fileObj.stream().getReader();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }

          const totalLength = chunks.reduce(
            (acc, chunk) => acc + chunk.length,
            0
          );
          _fileBuffer = Buffer.concat(chunks, totalLength);
        } else {
          // If neither arrayBuffer nor stream is available, try to get the raw data
          console.log("📄 Trying to get raw file data");
          if (fileObj._buf) {
            _fileBuffer = fileObj._buf;
          } else if (fileObj.buffer) {
            _fileBuffer = Buffer.from(fileObj.buffer);
          } else {
            console.log("❌ No way to access file data");
            return NextResponse.json(
              {
                error: "Unable to process file data - unsupported file format",
              },
              { status: 400 }
            );
          }
        }

        console.log("✅ File processed successfully:", fileName, fileSize);
      } else {
        console.log("❌ Invalid file data type");
        return NextResponse.json(
          { error: "Invalid file data" },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("❌ Error processing file data:", error);
      return NextResponse.json(
        { error: "Error processing file data" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [".txt", ".json"];
    const fileExtension = fileName
      .toLowerCase()
      .substring(fileName.lastIndexOf("."));

    if (!allowedTypes.includes(fileExtension)) {
      return NextResponse.json(
        { error: "Only .txt and .json files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (2MB limit)
    const maxFileSize = 2 * 1024 * 1024; // 2MB
    if (fileSize > maxFileSize) {
      return NextResponse.json(
        { error: "File size must not exceed 2MB" },
        { status: 400 }
      );
    }

    // Get user from database
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      include: { subscription: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get current plan limits
    const plan = dbUser.subscription?.plan || "STARTER";
    const planLimits = {
      STARTER: 5 * 1024 * 1024, // 5MB
      GROWTH: 10 * 1024 * 1024, // 10MB
      PRO: 25 * 1024 * 1024, // 25MB
    };

    const maxTotalSize =
      planLimits[plan as keyof typeof planLimits] || planLimits.STARTER;

    // Calculate current total upload size for this domain
    const existingFiles = await client.fileUpload.findMany({
      where: { domainId },
      select: { fileSize: true },
    });

    const currentTotalSize = existingFiles.reduce(
      (sum, file) => sum + file.fileSize,
      0
    );
    const newTotalSize = currentTotalSize + fileSize;

    if (newTotalSize > maxTotalSize) {
      return NextResponse.json(
        {
          error: `Total upload size would exceed your plan limit (${Math.round(
            maxTotalSize / (1024 * 1024)
          )}MB). Please upgrade your plan or remove some files.`,
        },
        { status: 400 }
      );
    }

    // ✅ NEW: Process file content for AI integration
    let fileContent = "";
    let uploadStatus = "PROCESSING";

    try {
      // Extract text content from file
      if (fileExtension === ".txt") {
        fileContent = _fileBuffer.toString("utf-8");
      } else if (fileExtension === ".json") {
        // Validate and format JSON content
        const jsonData = JSON.parse(_fileBuffer.toString("utf-8"));
        fileContent = JSON.stringify(jsonData, null, 2);
      }

      console.log(
        "📄 File content extracted:",
        fileContent.substring(0, 200) + "..."
      );
      uploadStatus = "COMPLETED";
    } catch (error) {
      console.error("❌ Error processing file content:", error);
      uploadStatus = "FAILED";
      fileContent = "";
    }

    // For now, we'll store the file content in the database
    // In production, you'd upload to cloud storage (AWS S3, Google Cloud Storage, etc.)
    const storedFileName = `${Date.now()}_${fileName}`;
    const filePath = `/uploads/${domainId}/${storedFileName}`;

    // Create file upload record with content
    const fileUpload = await client.fileUpload.create({
      data: {
        fileName: fileName,
        fileSize: fileSize,
        fileType: fileExtension,
        filePath: filePath,
        uploadStatus: uploadStatus,
        userId: dbUser.id,
        domainId: domainId,
        // Store file content temporarily in database
        // In production, this would be stored in cloud storage
        fileContent: fileContent.substring(0, 10000), // Limit to 10KB for database storage
      },
    });

    console.log("🎉 File upload completed successfully");
    return NextResponse.json({
      success: true,
      fileUpload,
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const domainId = searchParams.get("domainId");

    if (!domainId) {
      return NextResponse.json(
        { error: "Domain ID is required" },
        { status: 400 }
      );
    }

    // Get user from database
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get files for the domain
    const files = await client.fileUpload.findMany({
      where: {
        domainId,
        userId: dbUser.id,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      files,
    });
  } catch (error) {
    console.error("Error getting files:", error);
    return NextResponse.json({ error: "Failed to get files" }, { status: 500 });
  }
}
