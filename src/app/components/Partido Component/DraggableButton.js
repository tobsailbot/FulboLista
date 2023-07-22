import React, { useRef, useState, useEffect } from 'react';

const DraggableButton = () => {
  const [isDragging, setIsDragging] = useState(false);
  const buttonRef = useRef(null);
  const divRef = useRef(null);
  const initialPosition = useRef({ x: 0, y: 0 });

  const handleMouseDown = (event) => {
    setIsDragging(true);
    const { clientX, clientY } = event;
    const { left, top } = buttonRef.current.getBoundingClientRect();
    initialPosition.current = {
      x: clientX - left,
      y: clientY - top,
    };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (event) => {
    if (!isDragging) return;

    const { clientX, clientY } = event;
    const { left, top, width, height } = divRef.current.getBoundingClientRect();
    const { width: buttonWidth, height: buttonHeight } = buttonRef.current.getBoundingClientRect();

    const maxX = width - buttonWidth;
    const maxY = height - buttonHeight;

    let newPositionX = clientX - left - initialPosition.current.x;
    let newPositionY = clientY - top - initialPosition.current.y;

    // Limitar el botón dentro de los bordes del div
    newPositionX = Math.max(0, Math.min(newPositionX, maxX));
    newPositionY = Math.max(0, Math.min(newPositionY, maxY));

    buttonRef.current.style.transform = `translate(${newPositionX}px, ${newPositionY}px)`;
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={divRef}
      style={{
        width: '400px',
        height: '400px',
        border: '1px solid black',
        position: 'relative',
        overflow: 'hidden', // Evita que el botón se salga del div
      }}
    >
      <button
        ref={buttonRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '50px',
          height: '50px',
          borderRadius: '50%', // Hace que el botón tenga forma redonda
          backgroundColor: 'lime', // Cambia el color del botón a verde
        }}
        onMouseDown={handleMouseDown}
      >
      </button>
    </div>
  );
};

export default DraggableButton;
