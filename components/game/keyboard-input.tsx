"use client";

import React from "react"

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";

interface KeyboardInputProps {
  onSubmit: (value: string) => void;
}

export function KeyboardInput({ onSubmit }: KeyboardInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      setValue("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        ref={inputRef}
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type answer..."
        className="font-mono text-center w-32"
        aria-label="Type your answer"
      />
      <Button type="submit" size="sm" variant="secondary" disabled={!value.trim()}>
        Submit
      </Button>
    </form>
  );
}
