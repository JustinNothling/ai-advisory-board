import { db } from "@/lib/db";
import { advisors, testRuns } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { seed } from "@/lib/db/seed";
import { AdvisorCard } from "@/components/advisor-card";
import { LinkButton } from "@/components/link-button";
import { Plus, Brain } from "lucide-react";

seed();

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const allAdvisors = db.select().from(advisors).all();

  const advisorData = allAdvisors.map((advisor) => {
    const latestRun = db
      .select()
      .from(testRuns)
      .where(eq(testRuns.advisorId, advisor.id))
      .orderBy(desc(testRuns.runAt))
      .limit(1)
      .get();

    return {
      advisor,
      latestScore: latestRun?.overallScore ?? null,
    };
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            AI Advisory Board
          </h1>
          <p className="text-muted-foreground mt-1">
            {allAdvisors.length} advisor{allAdvisors.length !== 1 ? "s" : ""} •
            Create, test, and refine AI personas modeled on real people
          </p>
        </div>
        <LinkButton href="/advisors/new">
          <Plus className="h-4 w-4 mr-2" />
          New Advisor
        </LinkButton>
      </div>

      {advisorData.length === 0 ? (
        <div className="text-center py-20">
          <Brain className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-medium mb-2">No advisors yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first AI advisor to get started
          </p>
          <LinkButton href="/advisors/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Advisor
          </LinkButton>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {advisorData.map(({ advisor, latestScore }) => (
            <AdvisorCard
              key={advisor.id}
              advisor={advisor}
              latestScore={latestScore}
            />
          ))}
        </div>
      )}
    </div>
  );
}
