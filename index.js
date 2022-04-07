const core = require("@actions/core");
const exec = require("@actions/exec");

async function run() {
  try {
    const repositoryName = core.getInput("repository_name");
    const tagName = core.getInput("tag_name");
    const tarballUrl = core.getInput("tarball_url");
    const awsRepoUrl = core.getInput("aws_repo_url");
    const awsCcUsername = core.getInput("aws_cc_username");
    const awsCcPassword = core.getInput("aws_cc_password");
    const awsCcBranchname = core.getInput("aws_cc_branchname");
    const githubToken = core.getInput("github_token");

    const repoDir = "deploy_repo";
    const archiveName = `${repositoryName}-${tagName}`;

    core.info("Cloning AWS CC repo");

    await exec.exec(
      `git clone https://${uriEncode(awsCcUsername)}:${uriEncode(
        awsCcPassword
      )}@${awsRepoUrl} ${repoDir}`
    );

    core.info("Downloading release");

    await exec.exec(
      `curl -H "Authorization: token ${githubToken}" -sL "${tarballUrl}" > ${archiveName}.tar.gz`
    );

    core.info("Unpacking release");

    await exec.exec(
      `tar -xzf ${archiveName}.tar.gz -C ${repoDir} --strip-components 1`
    );

    core.info("Configuring AWS CC repo");

    await exec.exec(
      `cd ${repoDir} && git config user.email "deployer@speedchain.com" && git config user.name "Deployer"`
    );

    core.info("Committing changes to AWS CC repo");

    await exec.exec(
      `cd ${repoDir} && git add . && git commit -m "${tagName}" && git push origin ${awsCcBranchname}`
    );
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
