import type { FilmPerforationsProps } from "../../interfaces/FilmPerforations";

export const FilmPerforations = ({ colorHex }: FilmPerforationsProps) => (
    <div className="absolute inset-0 flex flex-col justify-around items-center py-2">
        {[...Array(10)].map((_, i) => (
            <div 
                key={i} 
                className="w-5 h-6 rounded-sm" 
                style={{ backgroundColor: colorHex }}
            />
        ))}
    </div>
);