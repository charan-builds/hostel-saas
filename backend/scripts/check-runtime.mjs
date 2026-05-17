import process from "node:process";

const MIN_NODE = {
  major: 20,
  minor: 9,
};

function parseNodeVersion(version) {
  const [major = 0, minor = 0, patch = 0] = version
    .split(".")
    .map((part) => Number.parseInt(part, 10));

  return { major, minor, patch };
}

function isSupportedNode({ major, minor }) {
  return major > MIN_NODE.major || (major === MIN_NODE.major && minor >= MIN_NODE.minor);
}

const node = parseNodeVersion(process.versions.node);

if (!isSupportedNode(node)) {
  console.error(
    `Node ${process.versions.node} is not supported. Use Node ${MIN_NODE.major}.${MIN_NODE.minor}+; this repo is pinned to Node 22 via .nvmrc.`,
  );
  process.exit(1);
}

console.log(`Runtime check passed: Node ${process.versions.node}.`);
