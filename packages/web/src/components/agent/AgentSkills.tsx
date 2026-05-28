import { useState, useEffect } from "react";
import { Globe, FolderOpen, RefreshCw } from "lucide-react";
import apiClient from "../../api/client";
import type { SkillInfo } from "@slock-ai/shared";
import SurfaceListItem from "../ui/SurfaceListItem";
import SectionEyebrow from "../ui/SectionEyebrow";

interface SkillsData {
  global: SkillInfo[];
  workspace: SkillInfo[];
}

function SkillCard({ skill }: { skill: SkillInfo }) {
  return (
    <SurfaceListItem>
      <div className="flex items-center gap-2">
        <span className="font-bold text-sm text-black">{skill.displayName}</span>
        {skill.userInvocable && (
          <span className="inline-block border border-black bg-brutal-lime px-1.5 py-0 text-[10px] font-bold uppercase">
            /{skill.name}
          </span>
        )}
      </div>
      {skill.description && (
        <p className="text-xs text-black/60 mt-1 line-clamp-2">{skill.description}</p>
      )}
    </SurfaceListItem>
  );
}

function groupByPath(skills: SkillInfo[]): Map<string, SkillInfo[]> {
  const groups = new Map<string, SkillInfo[]>();
  for (const skill of skills) {
    const key = skill.sourcePath || "unknown";
    const list = groups.get(key) || [];
    list.push(skill);
    groups.set(key, list);
  }
  return groups;
}

function PathGroup({ path, skills }: { path: string; skills: SkillInfo[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <code className="text-[11px] text-black/40 font-mono">{path}</code>
        <span className="text-[11px] text-black/30 font-mono">({skills.length})</span>
      </div>
      <div className="space-y-2">
        {skills.map((skill) => (
          <SkillCard key={skill.name} skill={skill} />
        ))}
      </div>
    </div>
  );
}

function SkillSubSection({ label, icon: Icon, skills, emptyText }: {
  label: string;
  icon: typeof Globe;
  skills: SkillInfo[];
  emptyText: string;
}) {
  const groups = groupByPath(skills);

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={12} className="text-black/40" />
        <span className="text-xs text-black/50 font-medium">
          {label}
        </span>
        <span className="text-xs text-black/30 font-mono">({skills.length})</span>
      </div>
      {skills.length > 0 ? (
        <div className="space-y-4">
          {[...groups.entries()].map(([path, pathSkills]) => (
            <PathGroup key={path} path={path} skills={pathSkills} />
          ))}
        </div>
      ) : (
        <p className="text-xs italic text-black/40">{emptyText}</p>
      )}
    </div>
  );
}

export default function AgentSkills({ agentId, embedded }: { agentId: string; embedded?: boolean }) {
  const [data, setData] = useState<SkillsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<SkillsData>(`/agents/${agentId}/skills`);
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load skills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [agentId]);

  if (loading) {
    return (
      <div className={embedded ? "px-5 py-4" : "flex flex-1 items-center justify-center bg-white"}>
        <span className="text-sm text-black/40 font-mono">Loading skills…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={embedded ? "px-5 py-4 flex flex-col items-center gap-3" : "flex flex-1 flex-col items-center justify-center gap-3 bg-white"}>
        <span className="text-sm text-black/60 font-mono">{error}</span>
        <button onClick={fetchSkills} className="btn-brutal-sm px-2 py-1 bg-white flex items-center gap-1 text-xs font-bold">
          <RefreshCw size={12} />
          Retry
        </button>
      </div>
    );
  }

  const totalSkills = (data?.global?.length || 0) + (data?.workspace?.length || 0);

  return (
    <div className={embedded ? "" : "flex-1 overflow-y-auto bg-white"}>
      <div className="px-5 py-4">
        <SectionEyebrow as="div" className="mb-3">
          Skills ({totalSkills})
        </SectionEyebrow>
        <div className="space-y-4">
          <SkillSubSection
            label="Global"
            icon={Globe}
            skills={data?.global || []}
            emptyText="No global skills installed on this computer"
          />
          <SkillSubSection
            label="Workspace"
            icon={FolderOpen}
            skills={data?.workspace || []}
            emptyText="No skills in this agent's workspace"
          />
        </div>
      </div>
    </div>
  );
}
