const core = require("@actions/core");
const exec = require("@actions/exec");

async function run() {
  try {
    const repositoryName = core.getInput("repository_name");
    const tagName = core.getInput("tag_name");
    const isPrerelease = core.getInput("prerelease") === "true";
    const author = core.getInput("author");
    const message = core.getInput("message");
    const tarballUrl = core.getInput("tarball_url");
    const githubToken = core.getInput("github_token");

    const awsRepoUrl = new URL(core.getInput("aws_repo_url"));
    awsRepoUrl.username = core.getInput("aws_cc_username");
    awsRepoUrl.password = core.getInput("aws_cc_password");

    const mainBranchName = core.getInput("main_branch_name");
    const stagingBranchName = core.getInput("staging_branch_name");

    const awsCcBranchname = isPrerelease ? stagingBranchName : mainBranchName;

    const repoDir = "deploy_repo";
    const archiveName = `${repositoryName}-${tagName}`;
    const releaseMessage = `Release ${tagName} by ${author}\n\n${message}`;

    core.info("Cloning AWS CC repo");

    await exec.exec("git", ["clone", awsRepoUrl.toString(), repoDir]);

    await exec.exec("git", ["checkout", awsCcBranchname], {
      cwd: repoDir,
    });

    core.info("Marking old files for deletion");

    await exec.exec("git", ["rm", "-rf", "."], {
      cwd: repoDir,
    });

    core.info("Downloading release");

    await exec.exec("curl", [
      "-H",
      `Authorization: token ${githubToken}`,
      "-sL",
      tarballUrl,
      "-o",
      `${archiveName}.tar.gz`,
    ]);

    core.info("Unpacking release");

    await exec.exec("tar", [
      "-xzf",
      `${archiveName}.tar.gz`,
      "-C",
      repoDir,
      "--strip-components",
      "1",
    ]);

    core.info("Configuring AWS CC repo");

    await exec.exec(
      "git",
      ["config", "user.email", "deployer@speedchain.com"],
      {
        cwd: repoDir,
      }
    );

    await exec.exec("git", ["config", "user.name", "Deployer"], {
      cwd: repoDir,
    });

    core.info("Committing changes to AWS CC repo");

    await exec.exec("git", ["add", "."], { cwd: repoDir });

    await exec.exec("git", ["commit", "-m", releaseMessage], { cwd: repoDir });

    await exec.exec("git", ["push", "-u", "origin", awsCcBranchname], {
      cwd: repoDir,
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
