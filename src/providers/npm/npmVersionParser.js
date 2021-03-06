/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as semver from 'semver';
import {
  fileDependencyRegex,
  gitHubDependencyRegex,
  formatWithExistingLeading
} from '../../common/utils';
import appSettings from '../../common/appSettings';
import { mapTaggedVersions, tagFilter, isFixedVersion } from '../../common/versions';
import { npmViewVersion, npmViewDistTags } from './npmAPI'

export function npmVersionParser(node, appConfig) {
  const { name, value: requestedVersion } = node;
  let result;

  // check if we have a local file version
  if (result = parseFileVersion(node, name, requestedVersion))
    return result;

  // TODO: implement raw git url support too

  // check if we have a github version
  if (result = parseGithubVersion(node, name, requestedVersion, appConfig.githubTaggedCommits))
    return result;

  // must be a registry version
  return parseNpmRegistryVersion(
    node,
    name,
    requestedVersion,
    appConfig
  );
}

export function parseNpmRegistryVersion(node, name, requestedVersion, appConfig, customGenerateVersion = null) {
  // check if its a valid semver, if not could be a tag like 'latest'
  const isValidSemver = semver.validRange(requestedVersion);

  // check if this is a fixed version
  const isFixed = isValidSemver && isFixedVersion(requestedVersion);

  // get the matched version
  const viewVersionArg = `${name}@${requestedVersion}`;
  return npmViewVersion(viewVersionArg)
    .then(matchedVersion => {

      return npmViewDistTags(name)
        .then(tags => {
          // insert the 'Matches' entry before all other tagged entries
          const matchesEntry = { name: 'Matches', version: matchedVersion };
          tags.splice(0, 0, matchesEntry);

          // only show 'Matches' and 'latest' entries when showTaggedVersions is false
          // filter by the appConfig.npmDistTagFilter
          let tagsToProcess;
          if (appSettings.showTaggedVersions === false)
            tagsToProcess = [
              tags[0], // matches entry
              tags[1]  // latest entry
            ];
          else if (appConfig.npmDistTagFilter.length > 0)
            tagsToProcess = tagFilter(tags, [
              'Matches',
              'Latest',
              ...appConfig.npmDistTagFilter
            ]);
          else
            tagsToProcess = tags;

          // map the tags to packages
          return tagsToProcess
            .map((tag, index) => {
              const isTaggedVersion = index !== 0;

              // generate the package data for each tag
              const packageInfo = {
                type: 'npm',
                isValidSemver,
                isFixedVersion: isFixed,
                tag,
                isTaggedVersion
              };

              return {
                node,
                package: generatePackage(
                  name,
                  requestedVersion,
                  packageInfo,
                  customGenerateVersion
                )
              };
            });
        });
    })
    .catch(error => {
      // show the 404 to the user; otherwise throw the error
      if (error.code === 'E404')
        return [{
          node,
          package: generatePackage(
            name,
            null,
            { type: 'npm', notFound: true },
            null
          )
        }];

      console.error(error);
      throw error;
    });
}

export function parseFileVersion(node, name, version) {
  const fileRegExpResult = fileDependencyRegex.exec(version);
  if (fileRegExpResult) {
    const packageInfo = {
      type: "file",
      remoteUrl: `${fileRegExpResult[1]}`
    };

    return [{
      node,
      package: generatePackage(
        name,
        version,
        packageInfo,
        customGenerateVersion
      )
    }];
  }
}

export function parseGithubVersion(node, name, version, githubTaggedVersions) {
  const gitHubRegExpResult = gitHubDependencyRegex.exec(version);
  if (gitHubRegExpResult) {
    const proto = "https";
    const user = gitHubRegExpResult[1];
    const repo = gitHubRegExpResult[3];
    const userRepo = `${user}/${repo}`;
    const commitish = gitHubRegExpResult[4] ? gitHubRegExpResult[4].substring(1) : '';
    const commitishSlug = commitish ? `/commit/${commitish}` : '';
    const remoteUrl = `${proto}://github.com/${user}/${repo}${commitishSlug}`;

    // take a copy of the app config tagged versions
    const taggedVersions = githubTaggedVersions.slice();

    // ensure that commits are the first and the latest entries to be shown
    taggedVersions.splice(0, 0, 'Commit');

    // only show commits of showTaggedVersions is false
    if (appSettings.showTaggedVersions === false)
      taggedVersions = [taggedVersions[0]];

    return taggedVersions.map(category => {
      const packageInfo = {
        category,
        type: "github",
        remoteUrl,
        userRepo,
        commitish
      };

      const parseResult = {
        node,
        package: generatePackage(
          name,
          version,
          packageInfo,
          customGenerateVersion
        )
      };

      return parseResult;
    });
  }
}

export function customGenerateVersion(packageInfo, newVersion) {
  const existingVersion
  // test if the newVersion is a valid semver range
  // if it is then we need to use the commitish for github versions 
  if (packageInfo.meta.type === 'github' && semver.validRange(newVersion))
    existingVersion = packageInfo.meta.commitish
  else
    existingVersion = packageInfo.version

  // preserve the leading symbol from the existing version
  const preservedLeadingVersion = formatWithExistingLeading(existingVersion, newVersion)
  return `${packageInfo.meta.userRepo}#${preservedLeadingVersion}`
}

function generatePackage(name, version, info, customGenerateVersion) {
  return {
    name,
    version,
    meta: info,
    customGenerateVersion
  };
}