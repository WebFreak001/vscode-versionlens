/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { tagFilter } from '../../../src/common/versions';

describe('Versions', () => {

  describe('tagFilter', () => {

    it('returns all tags when no filter is specified', () => {
      const testTags = [
        { name: 'latest' },
        { name: 'rc' },
        { name: 'beta' },
        { name: 'alpha' },
        { name: 'discovery' }
      ];
      const testFilter = [];
      const results = tagFilter(testTags, testFilter);

      assert.equal(
        results.length,
        testTags.length,
        `Length not equal. Expected ${results.length} to be ${testTags.length}`
      );

      results.forEach((result, index) => {
        assert.equal(
          result.name,
          testTags[index].name,
          `tag.name[index]: Not equal. Expected ${result.name} to be ${testTags[index].name}`
        );
      })

    });

    it('returns only tags in the specified filter array', () => {
      const testTags = [
        { name: 'latest' },
        { name: 'rc' },
        { name: 'beta' },
        { name: 'alpha' },
        { name: 'discovery' }
      ];
      const testFilter = ['rc', 'alpha'];
      const results = tagFilter(testTags, testFilter);

      assert.equal(
        results.length,
        testFilter.length,
        `Length not equal. Expected ${results.length} to be ${testFilter.length}`
      );

      assert.equal(
        results[0].name,
        testFilter[0],
        `tag.name[index]: Not equal. Expected ${results[0].name} to be ${testFilter[0]}`
      );

      assert.equal(
        results[1].name,
        testFilter[1],
        `tag.name[index]: Not equal. Expected ${results[1].name} to be ${testFilter[1]}`
      );

    });

  });

});