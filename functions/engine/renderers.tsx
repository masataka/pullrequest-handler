/** @jsxImportSource npm:jsx-slack@5 */
import {
  JSXSlack,
  Blocks,
  Context,
  Divider,
  Fragment,
  Header,
  Section,
} from "npm:jsx-slack@5";
import type {
  Connection,
  KeyValueStore,
  RenderModel,
  Review,
  ReviewRequest,
} from "./types.ts";

function Description(props: { text: string | null }) {
  return (props.text
    ? (
      <Section>
        <pre>{props.text}</pre>
      </Section>
    )
    : null);
}

function UserLink(props: { login: string; slack?: string }) {
  return (props.slack ? <a href={`@${props.slack}`} /> : <i>{props.login}</i>);
}

function BranchLink(props: { url: string; ref: string; static?: boolean }) {
  return (props.static
    ? <i>{props.ref}</i>
    : <a href={`${props.url}/tree/${props.ref}`}>{props.ref}</a>);
}

function StatusSection(props: { test: boolean; text: string }) {
  return (
    <Section>
      {props.test ? ":large_green_circle:" : ":red_circle:"} <b>{props.text}</b>
    </Section>
  );
}

function Reviewers(
  props: { userMap: KeyValueStore<string>; reviewers: string[]; text: string },
) {
  const count = props.reviewers.length;
  if (count == 0) {
    return null;
  }
  return (
    <Context>
      <span>&gt; {`${count} ${props.text}`}</span>
      {props.reviewers.map((login) => {
        return (
          <span>
            <UserLink login={login} slack={props.userMap[login]} />
          </span>
        );
      })}
    </Context>
  );
}

type ArrangeResult = {
  approvals: string[];
  changeRequesteds: string[];
  pendings: string[];
};

function arrangeReviewers(
  req: Connection<ReviewRequest>,
  rv: Connection<Review>,
): ArrangeResult {
  const requestedReviewer: KeyValueStore<string> = req.edges.reduce<
    KeyValueStore<string>
  >((previous, current) => {
    return { ...previous, [current.node.requestedReviewer.login]: "PENDING" };
  }, {});
  // Caution! here is "reduceRight"
  const reviewDetails = rv.edges.reduceRight<KeyValueStore<string>>(
    (previous, current) => {
      const { author: { login }, state } = current.node;
      // Prohibit excessive overwriting
      if (previous[login]) {
        return previous;
      }
      return { ...previous, [login]: state };
    },
    requestedReviewer,
  );
  return Object.keys(reviewDetails).reduce<ArrangeResult>(
    (previous, current) => {
      const state = reviewDetails[current];
      if (state === "APPROVED") {
        return { ...previous, approvals: [...previous.approvals, current] };
      }
      if (state === "CHANGES_REQUESTED") {
        return {
          ...previous,
          changeRequesteds: [...previous.changeRequesteds, current],
        };
      }
      if (state === "PENDING") {
        return { ...previous, pendings: [...previous.pendings, current] };
      }
      return previous;
    },
    { approvals: [], changeRequesteds: [], pendings: [] },
  );
}

function Commits(props: RenderModel) {
  const {
    url,
    pullRequest: {
      merged,
      state,
      commits: { totalCount },
      changedFiles,
      author: { login },
      baseRefName: base,
      headRefName: head,
    },
  } = props.repository;
  const text = merged ? " merged" : " wants to merge";
  const commitUnit = totalCount < 2 ? "commit" : "commits";
  const changeUnit = changedFiles < 2 ? "change" : "changes";
  return (
    <Context>
      <span>
        [<b>{state}</b>] <UserLink login={login} slack={props.userMap[login]} />
        {` ${text} ${totalCount} ${commitUnit} (${changedFiles} file ${changeUnit}) into `}
        <BranchLink url={url} ref={base} /> from{" "}
        <BranchLink url={url} ref={head} static={merged} />
      </span>
    </Context>
  );
}

function Contents(props: RenderModel) {
  const { url, number, body } = props.repository.pullRequest;
  const text = body && body.trim();
  return (
    <Fragment>
      <Header>{props.repository.pullRequest.title}</Header>
      <Section>
        <b>
          <a href={url}>#{number}</a>
        </b>
      </Section>
      {text ? <Description text={text} /> : (
        <Section>
          <code>Caution, body of this pull request is empty.</code>
        </Section>
      )}
    </Fragment>
  );
}

const pr_approved = "Changes approved";
const no_review = "No requested reviewer";
const ch_requested = "Changes requested";
const rv_requested = "Review requested";

function Approvals(props: RenderModel) {
  const { state, reviewRequests, reviews } = props.repository.pullRequest;
  if (state !== "OPEN") {
    return null;
  }

  const { approvals, changeRequesteds, pendings } = arrangeReviewers(
    reviewRequests,
    reviews,
  );
  const everybodyApproved = approvals.length > 0 &&
    changeRequesteds.length == 0 && pendings.length == 0;
  let text = "";
  if (
    approvals.length > 0 && changeRequesteds.length == 0 && pendings.length == 0
  ) {
    text = pr_approved;
  } else {
    if (approvals.length + changeRequesteds.length + pendings.length == 0) {
      text = no_review;
    } else if (changeRequesteds.length > 0) {
      text = ch_requested;
    } else {
      text = rv_requested;
    }
  }
  const unit = (list: string[]) => (list.length > 1 ? "s" : "");
  return (
    <Fragment>
      <StatusSection test={everybodyApproved} text={text} />
      <Reviewers
        userMap={props.userMap}
        reviewers={approvals}
        text={`approval${unit(approvals)}`}
      />
      <Reviewers
        userMap={props.userMap}
        reviewers={changeRequesteds}
        text={`reviewer${unit(approvals)} requested changes`}
      />
      <Reviewers
        userMap={props.userMap}
        reviewers={pendings}
        text={`pending reviewer${unit(approvals)}`}
      />
    </Fragment>
  );
}

const no_conflicts = "This branch has no conflicts with the base branch";
const must_be_resolved = "This branch has conflicts that must be resolved";
const merge_completed = "The merge is complete";
const closed_without_merge =
  "This pull request have been closed without merge.";

function Conflicts(props: RenderModel) {
  const { state, mergeable, merged } = props.repository.pullRequest;
  if (state === "OPEN") {
    const test = mergeable === "MERGEABLE";
    return (
      <StatusSection
        test={test}
        text={test ? no_conflicts : must_be_resolved}
      />
    );
  }
  return (
    <Section>
      <b>{merged ? merge_completed : closed_without_merge}</b>
    </Section>
  );
}

function Repository(props: RenderModel) {
  const { name, url, owner, pullRequest } = props.repository;
  const githubcom = <a href="https://github.com/">https://github.com</a>;
  const org = <a href={owner.url}>{owner.login}</a>;
  const repo = <a href={url}>{name}</a>;
  const pulls = <a href={`${props.repository.url}/pulls`}>pull</a>;
  const pull = <a href={pullRequest.url}>{pullRequest.number}</a>;
  return (
    <Context>
      <span>{githubcom} / {org} / {repo} / {pulls} / {pull}</span>
    </Context>
  );
}

export function renderNotification(props: RenderModel) {
  return JSXSlack(
    <Blocks>
      <Commits {...props} />
      <Contents {...props} />
      <Approvals {...props} />
      <Conflicts {...props} />
      <Repository {...props} />
      <Divider />
    </Blocks>
  );
}

function EditedLog(props: RenderModel) {
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

 function ClosedLog(props: RenderModel) {
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

 function ReviewRequestedLog(props: RenderModel) {
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

 function SubmittedLog(props: RenderModel) {
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

export function renderActionLog(props: RenderModel) {
  switch(props.action) {
    case "edited":
      return JSXSlack(EditedLog(props));
    case "closed": {
      const blocks = ClosedLog(props);
      return blocks ? JSXSlack(blocks) : null;
    }
    case "review_requested":
    case "review_request_removed":
      return JSXSlack(ReviewRequestedLog(props));
    case "submitted": {
      const blocks = SubmittedLog(props);
      return blocks ? JSXSlack(blocks) : null;
    }
    default:
      return null;
  }
}
