import React from "react";
import { Card } from '@/components/ui/card';
import {  useDraggable } from '@dnd-kit/core';

const DraggableItem = ({ id, title }:any) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: id,
      data: { title }
    });
  
    const style = transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      zIndex: 1
    } : undefined;
  
    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        <Card {...listeners} className="p-2 mb-2 bg-blue-100 cursor-move hover:bg-blue-200 transition-colors">
          {title}
        </Card>
      </div>
    );
  };

  export default DraggableItem