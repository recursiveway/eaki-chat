import React from "react";
import { useDroppable } from "@dnd-kit/core";

const DroppableZone = ({ children }:any) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'tone-droppable'
  });

  return (
    <div ref={setNodeRef} className={`p-4 border-2 border-dashed rounded ${isOver ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'}`}>
      {children}
    </div>
  );
};

export default DroppableZone