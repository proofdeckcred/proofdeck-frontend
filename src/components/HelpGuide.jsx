import React from "react";
import { Info, HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Button } from "./ui/button";

const HelpGuide = ({ title = "How to use", steps = [] }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full">
          <HelpCircle size={20} />
          <span className="sr-only">How to use</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 overflow-hidden" align="end">
        <div className="bg-indigo-600 px-4 py-3 text-white">
             <h4 className="font-semibold text-sm flex items-center gap-2">
                <Info size={16} />
                {title}
             </h4>
        </div>
        <div className="p-4 bg-white">
            <ul className="space-y-3">
                {steps.map((step, index) => (
                    <li key={index} className="flex gap-3 text-sm text-gray-600">
                        <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs mt-0.5">
                            {index + 1}
                        </span>
                        <span>{step}</span>
                    </li>
                ))}
            </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default HelpGuide;
