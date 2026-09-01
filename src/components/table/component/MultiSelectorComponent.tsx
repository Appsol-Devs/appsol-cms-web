import React, { useEffect, useState } from "react";
import { useController, type Control } from "react-hook-form";
import {
  Box,
  Chip,
  FormControl,
  IconButton,
  MenuItem,
  OutlinedInput,
  Select,
  type SelectChangeEvent,
  Typography,
} from "@mui/material";
import type { DropDownOption } from "@/components/DropdownComponent";
import CustomInputField from "@/components/CustomInputField";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const DEFAULT_EMPTY_OPTIONS: DropDownOption[] = [];

// 1. Updated Interface to accept react-hook-form props
interface MultiSelectProps {
  options: DropDownOption[];
  control: Control<any>;
  name: string;
  label?: string;
  title?: string;
  placeholder?: string;
  width?: number | string;
  disabled?: boolean;
}

const MultiSelectorComponent: React.FC<MultiSelectProps> = ({
  options = DEFAULT_EMPTY_OPTIONS,
  control,
  name,
  label,
  placeholder = "Select...",
  width = "100%",
  disabled = false,
}) => {
  const {
    field: { onChange, value = [] },
  } = useController({
    name,
    control,
    defaultValue: [],
  });

  const [search, setSearch] = useState("");
  const [displayOptions, setDisplayOptions] =
    useState<DropDownOption[]>(options);

  useEffect(() => {
    setDisplayOptions(
      options.filter(
        (option) =>
          !value.includes(option?.value?.toString()) &&
          option.label?.toString().toLowerCase().includes(search.toLowerCase()),
      ),
    );
  }, [value, search, options]);

  const handleChange = (event: SelectChangeEvent<typeof value>) => {
    const selectedValues = event.target.value;
    onChange(
      typeof selectedValues === "string"
        ? selectedValues.split(",")
        : selectedValues,
    );
  };

  const handleDelete = (item: string) => {
    onChange(value.filter((v: string) => v !== item));
  };

  return (
    <FormControl sx={{ width }} disabled={disabled}>
      {label && (
        <Typography sx={{ fontWeight: 500, fontSize: 12, marginBottom: "5px" }}>
          {label}
        </Typography>
      )}
      <Select
        multiple
        value={value}
        onChange={handleChange}
        displayEmpty
        MenuProps={MenuProps}
        renderValue={(selected) => {
          const safeSelected = selected || [];

          return safeSelected.length === 0 ? (
            <em className="text-gray-400 not-italic text-sm">{placeholder}</em>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {safeSelected.map((val: string) => (
                <Chip
                  key={val}
                  size="small"
                  sx={{ fontSize: "12px", paddingBlock: "3px" }}
                  label={
                    options.find(
                      (opt) =>
                        opt.value ===
                        (typeof val === "string"
                          ? val?.toString()
                          : (val as any).value?.toString()),
                    )?.label || val
                  }
                  onDelete={() => handleDelete(val)}
                  deleteIcon={
                    <IconButton
                      onMouseDown={(event) => event.stopPropagation()}
                      size="small"
                      disabled={disabled}
                    >
                      x
                    </IconButton>
                  }
                />
              ))}
            </Box>
          );
        }}
        input={
          <OutlinedInput
            sx={{
              backgroundColor: disabled ? "#f5f5f5" : "white",
              borderRadius: "8px",
              fontSize: "14px",
              padding: "0px",
              display: "flex",
              alignItems: "center",
              "& .MuiOutlinedInput-input": {
                padding: "8px 12px",
                height: "100%",
                display: "flex",
                alignItems: "center",
              },
              "&.MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#ccc" },
                "& :hover fieldset": {
                  borderColor: disabled ? "#ccc" : "#888",
                },
                "&.Mui-focused fieldset": { borderColor: "var(--primary)" },
              },
            }}
          />
        }
      >
        <MenuItem disableRipple>
          <CustomInputField
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
            customClass="w-full"
          />
        </MenuItem>

        {displayOptions.length === 0 ? (
          <MenuItem disabled>No options found</MenuItem>
        ) : (
          displayOptions.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              sx={{ fontSize: "12px" }}
              divider
            >
              {option.label}
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  );
};

export default MultiSelectorComponent;
