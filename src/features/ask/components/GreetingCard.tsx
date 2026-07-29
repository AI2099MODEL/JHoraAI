import React from "react";

interface GreetingCardProps {
  userName: string;
}

export const GreetingCard: React.FC<GreetingCardProps> = ({ userName }) => {
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good Morning";
    if (hours < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="py-6 px-4 mb-6 text-center md:text-left">
      <h1 className="text-3xl font-sans font-semibold tracking-tight text-slate-900 transition-colors">
        {getGreeting()}, <span className="text-blue-600 font-bold">{userName}</span>
      </h1>
      <p className="mt-2 text-slate-500 text-sm font-sans">
        Welcome to your premium AI Astrology Workspace. How may I guide your research today?
      </p>
    </div>
  );
};
