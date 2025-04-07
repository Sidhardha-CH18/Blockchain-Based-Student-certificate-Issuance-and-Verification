export function Card({ children, className = "" }) {
    return (
      <div className={`p-5 bg-white shadow-lg rounded-xl ${className}`}>
        {children}
      </div>
    );
  }
  