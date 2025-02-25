import DOMPurify from "dompurify";
import React from "react";
import { api } from "~/trpc/react";
import { searchValueAtom } from "./search-bar";
import { useAtom } from "jotai";
import { useDebounceValue } from "usehooks-ts";
import useThreads from "~/hooks/use-threads";

const SearchDisplay = () => {
  const [searchValue] = useAtom(searchValueAtom);
  const search = api.account.searchEmails.useMutation();

  //adding debounce
  const [debounceSearchValue] = useDebounceValue(searchValue, 500);
  const { accountId } = useThreads();

  React.useEffect(() => {
    // console.log("Searching for:", debounceSearchValue)
    if (!debounceSearchValue || !accountId) return;
    search.mutate({
      accountId,
      query: debounceSearchValue,
    });
  }, [debounceSearchValue, accountId]);
  return (
    <div className="max-h-[calc(100vh-50px)] overflow-y-scroll p-4">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-sm text-gray-800 dark:text-gray-400">
          Your search for &quot;{searchValue}&quot; came back with ...
        </h2>
      </div>
      {search.data?.hits.length === 0 ? (
        <>
          <p>No result</p>
        </>
      ) : (
        <>
          <ul className="flex flex-col gap-2">
          {search.data?.hits.map((hit) => (
            <li
              key={hit.id}
              className="cursor-pointer list-none rounded-md border p-4 transition-all hover:bg-gray-100 dark:hover:bg-gray-200"
            >
              <h3 className="text-base font-medium">{hit.document.subject}</h3>
              <p className="text-sm text-gray-500">From: {hit.document.from}</p>
              <p className="text-sm text-gray-500">
                To: {hit.document.to.join(", ")}
              </p>
              <p
                className="mt-2 text-sm"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(hit.document.rawBody, {
                    USE_PROFILES: { html: true },
                  }),
                }}
              ></p>
            </li>
          ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default SearchDisplay;
