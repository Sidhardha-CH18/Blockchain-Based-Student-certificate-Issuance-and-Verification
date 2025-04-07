export function Select({ options = [], onChange, className = "" }) {
    return (
      <select onChange={onChange} className={`border p-2 rounded-lg w-full bg-white ${className}`}>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
  