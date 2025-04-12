import React, { createContext, useContext, useState } from 'react';

interface SubjectsContextType {
  subjectA: string;
  subjectB: string;
  setSubjects: (a: string, b: string) => void;
}

const SubjectsContext = createContext<SubjectsContextType | undefined>(undefined);

export function SubjectsProvider({ children }: { children: React.ReactNode }) {
  const [subjectA, setSubjectA] = useState('');
  const [subjectB, setSubjectB] = useState('');

  const setSubjects = (a: string, b: string) => {
    setSubjectA(a);
    setSubjectB(b);
  };

  return (
    <SubjectsContext.Provider value={{ subjectA, subjectB, setSubjects }}>
      {children}
    </SubjectsContext.Provider>
  );
}

export function useSubjects() {
  const context = useContext(SubjectsContext);
  if (context === undefined) {
    throw new Error('useSubjects must be used within a SubjectsProvider');
  }
  return context;
}