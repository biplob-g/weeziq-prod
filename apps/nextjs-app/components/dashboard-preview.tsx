import Image from "next/image";

export function DashboardPreview() {
  return (
    <div className="w-[calc(100vw-32px)] lg:w-[1100px]">
      <div className="bg-primary-light/50 rounded-2xl py-2 shadow-2xl mt-0">
        <div className="relative w-full h-full">
          {/* Static image without video functionality */}
          <div className="relative w-full h-full top-10">
            <Image
              src="/images/app-chats.png"
              alt="Dashboard preview"
              width={1280}
              height={700}
              className="w-full h-full object-cover rounded-xl shadow-lg mt-5"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
