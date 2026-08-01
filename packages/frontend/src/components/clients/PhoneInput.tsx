import { Controller, type Control, type FieldErrors } from "react-hook-form";

type PhoneInputProps<T extends Record<string, any>> = {
    control: Control<T>;
    errors: FieldErrors<T>;
    name: keyof T;
    label?: string;
    required?: boolean;
};

const countries = [
    { name: "Uruguay", code: "UY", prefix: "598" },
    { name: "Venezuela", code: "VE", prefix: "58" },
    { name: "Argentina", code: "AR", prefix: "54" },
    { name: "Cuba", code: "CU", prefix: "53" },
    { name: "Brasil", code: "BR", prefix: "55" },
    { name: "Colombia", code: "CO", prefix: "57" },
    { name: "Perú", code: "PE", prefix: "51" },
    { name: "Paraguay", code: "PY", prefix: "595" },
];

const PhoneInput = <T extends Record<string, any>>({
    control,
    errors,
    name,
    label = "Celular",
    required = false,
}: PhoneInputProps<T>) => {

    return (
        <>
            <label>{label}</label>

            <Controller
                name={name as any}
                control={control}
                rules={{ required }}
                render={({ field }) => {

                    const value = String(field.value || "");

                    const prefix = countries.find(country =>
                        value.startsWith(country.prefix)
                    )?.prefix || "598";

                    const number = value.replace(prefix, "");

                    return (
                        <div style={{ display: "flex", gap: "8px" }}>

                            <select
                                value={prefix}
                                onChange={(e) => {
                                    field.onChange(
                                        e.target.value + number
                                    );
                                }}
                            >
                                {countries.map(country => (
                                    <option
                                        key={country.code}
                                        value={country.prefix}
                                    >
                                        {country.name} (+{country.prefix})
                                    </option>
                                ))}
                            </select>


                            <input
                                type="tel"
                                value={number}
                                onChange={(e) => {
                                    field.onChange(
                                        prefix + e.target.value
                                    );
                                }}
                            />

                        </div>
                    );
                }}
            />

            {required && errors[name] && (
                <span className="error">
                    Este campo es requerido
                </span>
            )}
        </>
    );
};

export default PhoneInput;