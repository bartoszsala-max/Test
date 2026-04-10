"use client";

import * as React from "react";

type ToastVariant = "default" | "success" | "error";

interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastState { toasts: ToastData[]; }

type Action = { type: "ADD"; toast: ToastData } | { type: "REMOVE"; id: string };

function reducer(state: ToastState, action: Action): ToastState {
  switch (action.type) {
    case "ADD": return { toasts: [...state.toasts, action.toast] };
    case "REMOVE": return { toasts: state.toasts.filter((t) => t.id !== action.id) };
  }
}

let listeners: Array<(state: ToastState) => void> = [];
let memState: ToastState = { toasts: [] };

function dispatch(action: Action) {
  memState = reducer(memState, action);
  listeners.forEach((l) => l(memState));
}

let count = 0;

export function toast({ title, description, variant = "default", duration = 3000 }: Omit<ToastData, "id">) {
  const id = String(++count);
  dispatch({ type: "ADD", toast: { id, title, description, variant, duration } });
  setTimeout(() => dispatch({ type: "REMOVE", id }), duration);
}

export function useToast() {
  const [state, setState] = React.useState<ToastState>(memState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => { listeners = listeners.filter((l) => l !== setState); };
  }, []);
  return { toasts: state.toasts, toast, dismiss: (id: string) => dispatch({ type: "REMOVE", id }) };
}
