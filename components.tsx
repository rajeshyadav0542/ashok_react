import React, { useState, createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { Check } from 'lucide-react';

// --- Toast (sonner replacement) ---
interface ToastInfo {
  id: number;
  message: string;
  type: 'success' | 'error';
}

let toastId = 0;
const toastEvents = new EventTarget();

export const toast = {
  success: (message: string) => {
    toastEvents.dispatchEvent(new CustomEvent('addtoast', { detail: { message, type: 'success' } }));
  },
  error: (message: string) => {
    toastEvents.dispatchEvent(new CustomEvent('addtoast', { detail: { message, type: 'error' } }));
  },
};

export const Toaster: React.FC<{position?: string, richColors?: boolean}> = () => {
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  useEffect(() => {
    const addToast = (e: Event) => {
      const { message, type } = (e as CustomEvent).detail;
      const id = toastId++;
      setToasts(current => [...current, { id, message, type }]);
      setTimeout(() => {
        setToasts(current => current.filter(t => t.id !== id));
      }, 5000);
    };

    toastEvents.addEventListener('addtoast', addToast);
    return () => toastEvents.removeEventListener('addtoast', addToast);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(t => (
        <div key={t.id} className={`max-w-sm rounded-lg shadow-lg p-4 text-white text-sm ${t.type === 'success' ? 'bg-[#00AEEF]' : 'bg-[#E0007A]'}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
};


// --- Card ---
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => <div className={`bg-white border border-slate-200 rounded-xl ${className}`} {...props} />;
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => <div className={`p-6 ${className}`} {...props} />;
export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => <h3 className={`font-semibold tracking-tight ${className}`} {...props} />;
export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => <div className={`p-6 pt-0 ${className}`} {...props} />;
export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => <p className={`text-sm text-slate-500 ${className}`} {...props} />;

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-[#003D7C] text-white hover:bg-[#003D7C]/90',
      destructive: 'bg-[#E0007A] text-white hover:bg-[#E0007A]/90',
      outline: 'border border-slate-300 bg-transparent hover:bg-slate-100',
      secondary: 'bg-slate-100 text-[#003D7C] hover:bg-slate-100/80',
      ghost: 'hover:bg-slate-100',
      link: 'text-[#003D7C] underline-offset-4 hover:underline',
    };
    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    };
    return <button className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00AEEF] disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`} ref={ref} {...props} />;
  }
);


// --- Badge ---
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}
export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', ...props }) => {
    const variants = {
        default: 'border-transparent bg-[#003D7C] text-white',
        secondary: 'border-transparent bg-slate-200 text-slate-800',
        destructive: 'border-transparent bg-[#E0007A] text-white',
        outline: 'text-[#003D7C] border-slate-300',
    };
    return <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className}`} {...props} />;
};


// --- Input ---
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => (
        <input className={`flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00AEEF] disabled:cursor-not-allowed disabled:opacity-50 ${className}`} ref={ref} {...props} />
    )
);

// --- Tabs ---
const TabsContext = createContext<{ activeTab: string; setActiveTab: (value: string) => void; }>({ activeTab: '', setActiveTab: () => {} });
export const Tabs: React.FC<{ 
    defaultValue: string; 
    children: ReactNode; 
    className?: string;
    value?: string;
    onValueChange?: (value: string) => void;
}> = ({ defaultValue, children, className, value, onValueChange }) => {
  const [internalState, setInternalState] = useState(defaultValue);
  const isControlled = value !== undefined;
  const activeTab = isControlled ? value! : internalState;

  const setActiveTab = (tabValue: string) => {
    if (!isControlled) {
        setInternalState(tabValue);
    }
    if (onValueChange) {
        onValueChange(tabValue);
    }
  };
  return <TabsContext.Provider value={{ activeTab, setActiveTab }}><div className={className}>{children}</div></TabsContext.Provider>;
};
export const TabsList: React.FC<{ children: ReactNode; className?: string; }> = ({ children, className }) => <div className={`inline-flex h-10 items-center justify-center rounded-md bg-slate-200 p-1 text-slate-600 ${className}`}>{children}</div>;
export const TabsTrigger: React.FC<{ value: string; children: ReactNode; }> = ({ value, children }) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;
  return <button onClick={() => setActiveTab(value)} className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${isActive ? 'bg-white text-[#003D7C] shadow-sm' : 'hover:bg-white/50'}`}>{children}</button>;
};
export const TabsContent: React.FC<{ value: string; children: ReactNode; className?: string; }> = ({ value, children, className }) => {
  const { activeTab } = useContext(TabsContext);
  return activeTab === value ? <div className={`mt-2 ${className}`}>{children}</div> : null;
};


// --- Dialog ---
const DialogContext = createContext<{ open: boolean; setOpen: (open: boolean) => void; }>({ open: false, setOpen: () => {} });
export const Dialog: React.FC<{ open?: boolean, onOpenChange?: (open: boolean) => void, children: ReactNode }> = ({ children, open: controlledOpen, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  return <DialogContext.Provider value={{ open, setOpen }}>{children}</DialogContext.Provider>;
};
export const DialogTrigger: React.FC<{ children: ReactNode, asChild?: boolean }> = ({ children, asChild }) => {
  const { setOpen } = useContext(DialogContext);
  if (asChild) {
    const child = React.Children.only(children);
    if (React.isValidElement(child)) {
      const triggerProps = { 
        onClick: (e: React.MouseEvent) => {
          (child.props as any).onClick?.(e);
          setOpen(true);
        }
      };
      return React.cloneElement(child, triggerProps);
    }
  }
  return <div onClick={() => setOpen(true)}>{children}</div>;
};
export const DialogContent: React.FC<{ children: ReactNode; className?: string; }> = ({ children, className }) => {
  const { open, setOpen } = useContext(DialogContext);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
      <div className={`relative bg-white rounded-lg shadow-xl p-6 ${className}`} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};
export const DialogHeader: React.FC<{ children: ReactNode; className?: string; }> = ({ children, className }) => <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}>{children}</div>;
export const DialogTitle: React.FC<{ children: ReactNode; className?: string; }> = ({ children, className }) => <h2 className={`text-lg font-semibold leading-none tracking-tight text-[#003D7C] ${className}`}>{children}</h2>;
export const DialogDescription: React.FC<{ children: ReactNode; className?: string; }> = ({ children, className }) => <p className={`text-sm text-slate-500 ${className}`}>{children}</p>;


// --- Select ---
interface SelectContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  displayValue?: ReactNode;
  setDisplayValue: (node: ReactNode) => void;
}
const SelectContext = createContext<SelectContextValue | null>(null);
export const Select: React.FC<{ value: string, onValueChange: (value: string) => void, children: ReactNode }> = ({ value, onValueChange, children }) => {
  const [open, setOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState<ReactNode | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return <SelectContext.Provider value={{ open, setOpen, value, onValueChange, displayValue, setDisplayValue }}><div ref={ref} className="relative">{children}</div></SelectContext.Provider>
};
export const SelectTrigger: React.FC<{ children: ReactNode, className?: string; }> = ({ children, className }) => {
  const { open, setOpen } = useContext(SelectContext)!;
  return <button onClick={() => setOpen(!open)} className={`flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}>{children}</button>;
};
export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
    const { value, displayValue, setDisplayValue } = useContext(SelectContext)!;

    // This effect finds the child with the matching value to set the display text
    // It's a bit of a hack to replicate shadcn's behavior without complex children traversal
    useEffect(() => {
        if (!value) setDisplayValue(placeholder);
    }, [value, placeholder, setDisplayValue]);

    return <span className="text-[#003D7C]">{displayValue ?? placeholder}</span>;
};
export const SelectContent: React.FC<{ children: ReactNode, className?: string; }> = ({ children, className }) => {
  const { open } = useContext(SelectContext)!;
  return open ? <div className={`absolute z-50 mt-1 w-full rounded-md border bg-white p-1 text-[#003D7C] shadow-md ${className}`}>{children}</div> : null;
};
export const SelectItem: React.FC<{ value: string; children: ReactNode; }> = ({ value, children }) => {
  const { value: selectedValue, onValueChange, setOpen, setDisplayValue } = useContext(SelectContext)!;
  const isSelected = selectedValue === value;
  
  const handleSelect = () => {
    onValueChange(value);
    setDisplayValue(children);
    setOpen(false);
  };

  useEffect(() => {
    if (isSelected) {
        setDisplayValue(children);
    }
  }, [isSelected, children, setDisplayValue]);

  return (
    <div onClick={handleSelect} className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
      {isSelected && <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"><Check className="h-4 w-4" /></span>}
      {children}
    </div>
  );
};


// --- Tooltip ---
const TooltipContext = createContext<{ open: boolean; setOpen: (open: boolean) => void; }>({ open: false, setOpen: () => {} });
export const TooltipProvider: React.FC<{ children: ReactNode }> = ({ children }) => <>{children}</>;
export const Tooltip: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  return <TooltipContext.Provider value={{ open, setOpen }}>{children}</TooltipContext.Provider>;
};
export const TooltipTrigger: React.FC<{ children: ReactNode, asChild?: boolean }> = ({ children, asChild }) => {
  const { setOpen } = useContext(TooltipContext);
  
  if (asChild) {
    const child = React.Children.only(children);
    if (React.isValidElement(child)) {
      const triggerProps = {
        onMouseEnter: (e: React.MouseEvent) => {
          (child.props as any).onMouseEnter?.(e);
          setOpen(true);
        },
        onMouseLeave: (e: React.MouseEvent) => {
          (child.props as any).onMouseLeave?.(e);
          setOpen(false);
        },
      };
      return React.cloneElement(child, triggerProps);
    }
  }

  const triggerProps = {
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
  };
  return <div {...triggerProps}>{children}</div>;
};
export const TooltipContent: React.FC<{ children: ReactNode, className?: string; }> = ({ children, className }) => {
  const { open } = useContext(TooltipContext);
  return open ? <div className={`z-50 overflow-hidden rounded-md border bg-[#003D7C] px-3 py-1.5 text-xs text-white animate-in fade-in-0 zoom-in-95 ${className}`}>{children}</div> : null;
};