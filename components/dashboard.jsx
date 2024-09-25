"use client";

import { Card } from "@/components/ui/card";
import Link from "next/link";
import { FaChevronRight } from "react-icons/fa";

export default function DashboardCard({ title, description, actions, linkLabel, linkHref }) {
  return (
    <Card className="group hover:bg-accent hover:text-accent-foreground transition-shadow shadow-md hover:shadow-lg rounded-lg">
      <Link href={linkHref} className="flex h-full w-full flex-col items-start justify-between p-6" prefetch={false}>
        <div>
          <div className="mb-2 text-2xl font-bold">{title}</div>
          <p className="text-muted-foreground mb-4">{description}</p>
          <div className="space-y-2">
            {actions.map((action, index) => (
              <div key={index} className="flex items-center gap-2">
                {action.icon}
                <span>{action.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span>{linkLabel}</span>
          <FaChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    </Card>
  );
}
