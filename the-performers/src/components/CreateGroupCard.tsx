"use client";

import React from "react";

type CreateGroupCardProps = {
  groupName: string;
  onGroupNameChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  errorMessage?: string;
  successMessage?: string;
};

export function CreateGroupCard({
  groupName,
  onGroupNameChange,
  onSubmit,
  onCancel,
  errorMessage,
  successMessage,
}: CreateGroupCardProps) {
  return (
    <div
      className="
        relative w-full max-w-md mx-4
        bg-white/90
        backdrop-blur-md
        rounded-[32px]
        border-4 border-black
        shadow-[12px_12px_0px_#000]
        p-12
        flex flex-col items-center gap-4
      "
    >
      <h1 className="text-3xl font-semibold text-center">Create New Group</h1>

      <form onSubmit={onSubmit} className="w-full space-y-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="groupName" className="font-semibold text-sm uppercase tracking-wide">
            Group Name
          </label>
          <input
            type="text"
            id="groupName"
            value={groupName}
            onChange={(e) => onGroupNameChange(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-white text-black shadow-sm focus:outline-none"
            placeholder="Use letters, numbers, or underscores"
            autoFocus
            maxLength={50}
          />
          <p className="text-xs text-gray-600">Only letters, numbers, and underscores are allowed.</p>
        </div>

        {errorMessage && (
          <div className="w-full p-3 rounded-md text-red-700 bg-red-100 border border-red-300 text-center">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="w-full p-3 rounded-md text-green-700 bg-green-100 border border-green-300 text-center">
            {successMessage}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            type="submit"
            className="cursor-pointer px-5 py-2
                bg-yellow-200 text-black font-bold
                rounded-xl
                border-4 border-black
                shadow-[4px_4px_0px_#000]
                hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000]
              active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000]
              transition-all
              "
          >
            CREATE GROUP
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer px-5 py-2
                bg-red-200 text-black font-bold
                rounded-xl
                border-4 border-black
                shadow-[4px_4px_0px_#000]
                hover:bg-gray-100
                hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000]
              active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000]
              transition-all
              "
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

