# Publishes this plugin to GitHub.
#
#   pwsh -File scripts/publish.ps1 [-RepoName dsh-chat-entry] [-Private]
#
# Requires the GitHub CLI (https://cli.github.com/) signed in once:
#   gh auth login
# The script creates the repository under the signed-in account (or pushes to
# it when it already exists), then prints the spec others can install with.

param(
  [string]$RepoName = 'dsh-chat-entry',
  [switch]$Private
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Push-Location $root
try {
  if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw 'GitHub CLI not found. Install it from https://cli.github.com/ , then run: gh auth login'
  }

  gh auth status *> $null
  if ($LASTEXITCODE -ne 0) {
    throw 'GitHub CLI is not signed in. Run: gh auth login'
  }

  $owner = (gh api user --jq .login).Trim()
  if (-not $owner) { throw 'Could not read the signed-in GitHub account.' }

  if (-not (Test-Path "$root\.git")) {
    git init | Out-Null
    git add -A
    git commit -m 'feat: DeepSeek web entries for the DSH left sidebar' | Out-Null
  }

  $exists = gh repo view "$owner/$RepoName" *> $null
  if ($LASTEXITCODE -ne 0) {
    $visibility = if ($Private) { '--private' } else { '--public' }
    gh repo create "$owner/$RepoName" $visibility --source . --remote origin --push --description 'DeepSeek chat and platform entries for the DeepSeek Harness left sidebar.'
  } else {
    git remote remove origin 2> $null
    git remote add origin "https://github.com/$owner/$RepoName.git"
    git push -u origin HEAD
  }

  "`nPublished: https://github.com/$owner/$RepoName"
  "Install on another machine:"
  "  dsh plugin --profile desktop add github:$owner/$RepoName"
}
finally {
  Pop-Location
}
