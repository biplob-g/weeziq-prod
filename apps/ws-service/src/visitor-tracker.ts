interface Visitor {
  id: string;
  domainId: string;
  userAgent: string;
  timestamp: Date;
  lastActivity: Date;
  sessionData?: any;
}

interface DomainStats {
  activeVisitors: number;
  totalVisitors: number;
  visitors: Map<string, Visitor>;
}

// Request body interfaces
interface AddVisitorRequest {
  domainId: string;
  visitorId: string;
  visitorData?: any;
}

interface RemoveVisitorRequest {
  domainId: string;
  visitorId: string;
}

interface UpdateActivityRequest {
  domainId: string;
  visitorId: string;
}

export class VisitorTracker {
  private state: DurableObjectState;
  private env: any;
  private domains: Map<string, DomainStats> = new Map();

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    switch (url.pathname) {
      case "/visitors/add":
        return this.handleAddVisitor(request);
      case "/visitors/remove":
        return this.handleRemoveVisitor(request);
      case "/visitors/activity":
        return this.handleUpdateActivity(request);
      case "/stats/domain":
        return this.handleGetDomainStats(request);
      case "/stats/all":
        return this.handleGetAllStats(request);
      default:
        return new Response("Not found", { status: 404 });
    }
  }

  private async handleAddVisitor(request: Request): Promise<Response> {
    try {
      const body = (await request.json()) as AddVisitorRequest;
      const { domainId, visitorId, visitorData } = body;

      if (!domainId || !visitorId) {
        return new Response("Missing required fields", { status: 400 });
      }

      const visitor: Visitor = {
        id: visitorId,
        domainId,
        userAgent: visitorData?.userAgent || "Unknown",
        timestamp: new Date(),
        lastActivity: new Date(),
        sessionData: visitorData,
      };

      // Get or create domain stats
      if (!this.domains.has(domainId)) {
        this.domains.set(domainId, {
          activeVisitors: 0,
          totalVisitors: 0,
          visitors: new Map(),
        });
      }

      const domainStats = this.domains.get(domainId)!;
      domainStats.visitors.set(visitorId, visitor);
      domainStats.activeVisitors++;
      domainStats.totalVisitors++;

      // Store in KV for persistence
      await this.state.storage.put(`visitor:${domainId}:${visitorId}`, visitor);
      await this.state.storage.put(`domain:${domainId}`, {
        activeVisitors: domainStats.activeVisitors,
        totalVisitors: domainStats.totalVisitors,
      });

      return new Response(
        JSON.stringify({
          success: true,
          visitor,
          domainStats: {
            activeVisitors: domainStats.activeVisitors,
            totalVisitors: domainStats.totalVisitors,
          },
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error adding visitor:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }

  private async handleRemoveVisitor(request: Request): Promise<Response> {
    try {
      const body = (await request.json()) as RemoveVisitorRequest;
      const { domainId, visitorId } = body;

      if (!domainId || !visitorId) {
        return new Response("Missing required fields", { status: 400 });
      }

      const domainStats = this.domains.get(domainId);
      if (domainStats && domainStats.visitors.has(visitorId)) {
        domainStats.visitors.delete(visitorId);
        domainStats.activeVisitors = Math.max(
          0,
          domainStats.activeVisitors - 1
        );

        // Update KV storage
        await this.state.storage.delete(`visitor:${domainId}:${visitorId}`);
        await this.state.storage.put(`domain:${domainId}`, {
          activeVisitors: domainStats.activeVisitors,
          totalVisitors: domainStats.totalVisitors,
        });

        return new Response(
          JSON.stringify({
            success: true,
            domainStats: {
              activeVisitors: domainStats.activeVisitors,
              totalVisitors: domainStats.totalVisitors,
            },
          }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response("Visitor not found", { status: 404 });
    } catch (error) {
      console.error("Error removing visitor:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }

  private async handleUpdateActivity(request: Request): Promise<Response> {
    try {
      const body = (await request.json()) as UpdateActivityRequest;
      const { domainId, visitorId } = body;

      if (!domainId || !visitorId) {
        return new Response("Missing required fields", { status: 400 });
      }

      const domainStats = this.domains.get(domainId);
      if (domainStats && domainStats.visitors.has(visitorId)) {
        const visitor = domainStats.visitors.get(visitorId)!;
        visitor.lastActivity = new Date();

        // Update KV storage
        await this.state.storage.put(
          `visitor:${domainId}:${visitorId}`,
          visitor
        );

        return new Response(
          JSON.stringify({
            success: true,
            lastActivity: visitor.lastActivity,
          }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response("Visitor not found", { status: 404 });
    } catch (error) {
      console.error("Error updating visitor activity:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }

  private async handleGetDomainStats(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const domainId = url.searchParams.get("domainId");

      if (!domainId) {
        return new Response("Missing domainId parameter", { status: 400 });
      }

      const domainStats = this.domains.get(domainId);
      if (!domainStats) {
        return new Response(
          JSON.stringify({
            activeVisitors: 0,
            totalVisitors: 0,
            visitors: [],
          }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Clean up inactive visitors (inactive for more than 30 minutes)
      const now = new Date();
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

      for (const [visitorId, visitor] of domainStats.visitors.entries()) {
        if (visitor.lastActivity < thirtyMinutesAgo) {
          domainStats.visitors.delete(visitorId);
          domainStats.activeVisitors = Math.max(
            0,
            domainStats.activeVisitors - 1
          );
          await this.state.storage.delete(`visitor:${domainId}:${visitorId}`);
        }
      }

      // Update domain stats in KV
      await this.state.storage.put(`domain:${domainId}`, {
        activeVisitors: domainStats.activeVisitors,
        totalVisitors: domainStats.totalVisitors,
      });

      return new Response(
        JSON.stringify({
          activeVisitors: domainStats.activeVisitors,
          totalVisitors: domainStats.totalVisitors,
          visitors: Array.from(domainStats.visitors.values()).map((v) => ({
            id: v.id,
            userAgent: v.userAgent,
            timestamp: v.timestamp,
            lastActivity: v.lastActivity,
          })),
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error getting domain stats:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }

  private async handleGetAllStats(request: Request): Promise<Response> {
    try {
      const allStats: Record<string, any> = {};

      for (const [domainId, domainStats] of this.domains.entries()) {
        // Clean up inactive visitors
        const now = new Date();
        const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

        for (const [visitorId, visitor] of domainStats.visitors.entries()) {
          if (visitor.lastActivity < thirtyMinutesAgo) {
            domainStats.visitors.delete(visitorId);
            domainStats.activeVisitors = Math.max(
              0,
              domainStats.activeVisitors - 1
            );
            await this.state.storage.delete(`visitor:${domainId}:${visitorId}`);
          }
        }

        // Update domain stats in KV
        await this.state.storage.put(`domain:${domainId}`, {
          activeVisitors: domainStats.activeVisitors,
          totalVisitors: domainStats.totalVisitors,
        });

        allStats[domainId] = {
          activeVisitors: domainStats.activeVisitors,
          totalVisitors: domainStats.totalVisitors,
        };
      }

      return new Response(JSON.stringify(allStats), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error getting all stats:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }
}
