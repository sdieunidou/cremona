import type { ReactNode } from "react";
import type { ApiMember, BlockApi } from "../lib/discovery.js";

const CODE = "rounded bg-muted px-1 py-0.5 font-mono text-[0.8125rem] text-foreground";

/** Text with its `backtick` spans as code. */
function Prose({ text }: { text: string }) {
  const parts: ReactNode[] = text.split(/`([^`]+)`/).map((part, i) =>
    i % 2 ? (
      <code key={i} className={CODE}>
        {part}
      </code>
    ) : (
      part
    ),
  );
  return <>{parts}</>;
}

function MembersTable({
  caption,
  members,
  first,
}: {
  caption: string;
  members: ApiMember[];
  first: "Prop" | "Field";
}) {
  const defaults = members.some((m) => m.default !== undefined);
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-xl border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-muted/40 text-xs text-muted-foreground">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium">
              {first}
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Type
            </th>
            {defaults ? (
              <th scope="col" className="px-3 py-2 font-medium">
                Default
              </th>
            ) : null}
            <th scope="col" className="px-3 py-2 font-medium">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.name} className="border-t border-border align-top">
              <th scope="row" className="px-3 py-2 font-mono text-[0.8125rem] font-medium">
                {m.name}
                {m.optional ? "" : <span className="text-muted-foreground"> (required)</span>}
              </th>
              <td className="px-3 py-2">
                <code className={`${CODE} [overflow-wrap:anywhere]`}>{m.type}</code>
              </td>
              {defaults ? (
                <td className="px-3 py-2 font-mono text-[0.8125rem] text-muted-foreground">
                  {m.default ?? "—"}
                </td>
              ) : null}
              <td className="px-3 py-2 text-muted-foreground">
                {m.deprecated ? <strong className="text-foreground">Deprecated. </strong> : null}
                {m.description ? <Prose text={m.description} /> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A block's props reference, generated from its source (api.json). */
export function PropsReference({ api, name }: { api: BlockApi; name: string }) {
  const own = api.props.filter((p) => !p.from);
  const common = api.props.filter((p) => p.from).map((p) => p.name);
  return (
    <section aria-labelledby="props-heading" className="flex flex-col gap-4">
      <h2 id="props-heading" className="text-xl font-semibold tracking-tight">
        Props
      </h2>
      <p className="max-w-2xl text-sm/relaxed text-muted-foreground">
        <code className={CODE}>{`<${api.component} />`}</code> props. Defaults are the demo content
        shown above: pass your own.
        {common.length ? (
          <>
            {" "}
            Like every block it also takes{" "}
            {common.map((prop, i) => (
              <span key={prop}>
                {i ? (i === common.length - 1 ? " and " : ", ") : ""}
                <code className={CODE}>{prop}</code>
              </span>
            ))}
            .
          </>
        ) : null}
      </p>
      <MembersTable caption={`${name} props`} members={own} first="Prop" />
      {api.types.map((t) => (
        <div key={t.name} className="flex flex-col gap-2">
          <h3 className="font-mono text-sm font-semibold">{t.name}</h3>
          {t.props ? (
            <MembersTable caption={`${t.name} fields`} members={t.props} first="Field" />
          ) : (
            <code className={`${CODE} w-fit max-w-full [overflow-wrap:anywhere]`}>{t.type}</code>
          )}
        </div>
      ))}
    </section>
  );
}
