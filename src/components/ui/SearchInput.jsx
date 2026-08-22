import { Search } from "lucide-react";
import "./SearchInput.css";

export function SearchInput({ value, onChange, placeholder = "Pesquisar..." }) {
  return (
    <div className="search-input">
      <Search size={16} className="search-input-icon" />
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
