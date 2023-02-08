/** @jsxImportSource npm:jsx-slack@5 */
import { Blocks, Context, Section } from "npm:jsx-slack@5";
import { Description, UserLink } from "./messageRenderer.tsx";
import type { RenderModel } from "../graphTypes.ts";

export function EditedLog(props: RenderModel) {
  const { login } = props.sender;
  const slack = props.userMap[login];
  return (
    <Blocks>
      <Context>
        <b>
          <UserLink login={login} slack={slack} /> edited this body text
        </b>
      </Context>
    </Blocks>
  );
}

export function ClosedLog(props: RenderModel) {
  const { merged } = props.repository.pullRequest;
  if (!merged) {
    return null;
  }
  return (
    <Blocks>
      <Context>
        <b>
          This pull request has been closed{" "}
          {merged ? "and the merge is complete" : "without merge"}
        </b>
      </Context>
    </Blocks>
  );
}

export function ReviewRequestedLog(props: RenderModel) {
  const { login } = props.requestedReviewer!;
  const slack = props.userMap[login];
  const msg = props.action === "review_requested" ? "Awaiting" : "Removed";
  return (
    <Blocks>
      <Context>
        <b>
          {msg} requested review from <UserLink login={login} slack={slack} />
        </b>
      </Context>
    </Blocks>
  );
}

export function SubmittedLog(props: RenderModel) {
  const { state, author: { login }, body } = props.review!;
  const slack = props.userMap[login];
  if (state === "APPROVED") {
    const authorLogin = props.repository.pullRequest.author.login;
    const authorSlack = props.userMap[authorLogin];
    return (
      <Blocks>
        <Context>
          <b>
            <UserLink login={login} slack={slack} /> approved{" "}
            <UserLink
              login={authorLogin}
              slack={authorSlack}
            />'s changes.
          </b>
        </Context>
        <Description text={body} />
      </Blocks>
    );
  }
  if (body) {
    return (
      <Blocks>
        <Context>
          <b>
            <UserLink login={login} slack={slack} /> commented.
          </b>
        </Context>
        <Description text={body} />
      </Blocks>
    );
  }
  return null;
}
