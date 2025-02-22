import Avatar from "react-avatar";
import React from "react";
import Select from "react-select";
import { api } from "~/trpc/react";
import useThreads from "~/hooks/use-threads";

type Props = {
  placeholder: string;
  label: string;

  onChange: (values: { label: string; value: string }[]) => void;

  value: { label: string; value: string }[];
};


const TagInput = ({
  label,
  onChange,
  placeholder,
  value,
}: Props) => {
  const { accountId } = useThreads();
  const { data: suggestions } = api.account.getSuggestions.useQuery({
    accountId,
  });

  const [inputValue, setInputValue] = React.useState("");

  const options = suggestions?.map((suggestion) => ({
    label: (
        <span className="flex items-center">
            <Avatar name={suggestion.address} size='25' textSizeRatio={2} round={true}/>
            {" "}
            {suggestion.address}
        </span>
    ),
    value: suggestion.address,
  }));
  return (
    <div className="flex items-center rounded-md border">
      <span className="ml-3 text-sm text-gray-500">
        {label}
      </span>
      <Select
        onInputChange={setInputValue}

        value={value}
        // @ts-ignore
        onChange={onChange}
        //@ts-ignore
        options={inputValue ? options?.concat({
            label: <span>{inputValue}</span>,
            value: inputValue
        }): options}
        placeholder={placeholder}
        isMulti
        className="w-full flex-1"
        classNames={{
            control: () => {
                return '!border-none !outline-none !ring-0 !shadow-none focus:border-none focus:outline-none focus:ring-0 focus:shadow-none dark:bg-transparent'
            },
            multiValue: () => {
                return 'dark:!bg-gray-700'
            },
            multiValueLabel: () => {
                return 'dark:text-white dark:bg-gray-700 rounded-md'
            }
        }}
      />
    </div>
  );
};

export default TagInput;
