// The AIConsole Project
//
// Copyright 2023 10Clouds
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { isToday, isYesterday, sub } from 'date-fns';
import { useEffect, useState } from 'react';

import { Asset } from '@/types/assets/assetTypes';

const useGroupByDate = (data: Asset[]) => {
  const [groupedData, setGroupedData] = useState<{ title: string; test: (d: Date) => boolean; assets: Asset[] }[]>([]);

  useEffect(() => {
    data.sort((a, b) => {
      return new Date(b.last_modified).getTime() - new Date(a.last_modified).getTime();
    });

    const now = new Date();

    const groupDefinitions: { title: string; test: (d: Date) => boolean; assets: Asset[] }[] = [
      { title: 'Today', test: (d: Date) => isToday(d), assets: [] },
      { title: 'Yesterday', test: (d: Date) => isYesterday(d), assets: [] },

      // previous 5 days
      /*...[...Array(5)].map((_, index) => {
        const day = sub(new Date(), { days: index + 2 }); // Starting from the day before yesterday
        const dayOfWeek = day.toLocaleString('default', { weekday: 'long' });
        return {
          title: dayOfWeek,
          test: (d: Date) => isSameDay(d, day),
          assets: [],
        };
      }),*/

      // last 20 months
      ...[...Array(20)].map((_, index) => {
        const month = sub(new Date(), { months: index });

        const sameYear = month.getFullYear() === now.getFullYear();

        return {
          title: `${month.toLocaleString('default', { month: 'long' })}${sameYear ? '' : ` ${month.getFullYear()}`}`,
          test: (d: Date) => d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear(),
          assets: [],
        };
      }),

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      { title: 'Older', test: (_d: Date) => true, assets: [] },
    ];

    data.forEach((item) => {
      for (const { test, assets } of groupDefinitions) {
        if (test(new Date(item.last_modified))) {
          assets.push(item);
          return;
        }
      }
    });

    setGroupedData(groupDefinitions);
  }, [data]);

  return groupedData;
};

export default useGroupByDate;
