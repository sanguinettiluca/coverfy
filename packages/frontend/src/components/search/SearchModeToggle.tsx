import { Users, FileText } from "lucide-react";
import type { SearchMode } from "./search.type";

type Props = {
    mode: SearchMode;
    onChange: (mode: SearchMode) => void;
};

const SearchModeToggle = ({ mode, onChange }: Props) => (
    <div className="search-mode-toggle">
        <button
            type="button"
            className={`charts-tab ${mode === "clients" ? "charts-tab--active" : ""}`}
            onClick={() => onChange("clients")}
        >
            <Users size={15} />
            Clientes
        </button>
        <button
            type="button"
            className={`charts-tab ${mode === "policies" ? "charts-tab--active" : ""}`}
            onClick={() => onChange("policies")}
        >
            <FileText size={15} />
            Pólizas
        </button>
    </div>
);

export default SearchModeToggle;