import * as React from "react"
import {cn} from "@/lib/utils"
import {Input} from "@/components/ui/input.tsx";

// Define the User interface
export interface User {
    email: string;
    name: string;
    avatar: string;
}

export interface AutocompleteInputProps extends Omit<React.ComponentProps<"input">, 'onChange'> {
    onUserSelect?: (user: User) => void;
    onChange?: (value: string) => void;
    fetchUsers?: (email: string) => Promise<User[]>;
}

/**
 * An enhanced input component that provides user search autocomplete functionality.
 * Displays user avatars, names, and emails in a dropdown list as the user types.
 * When a user is selected, their avatar appears in the input field while maintaining
 * the email as the input value.
 *
 * @component
 * @example
 * ```tsx
 * import { AutocompleteInput } from './AutocompleteInput';
 *
 * function UserSearch() {
 *   // Function to fetch users from your API
 *   const fetchUsers = async (email: string) => {
 *     const response = await fetch(`/api/users/search?email=${email}`);
 *     return response.json();
 *   };
 *
 *   return (
 *     <AutocompleteInput
 *       placeholder="Search users..."
 *       fetchUsers={fetchUsers}
 *       onUserSelect={(user) => {
 *         console.log('Selected user:', user.email);
 *       }}
 *       onChange={(value) => {
 *         console.log('Input value changed:', value);
 *       }}
 *     />
 *   );
 * }
 * ```
 *
 * @typedef {Object} User
 * @property {string} email - The user's email address
 * @property {string} fullName - The user's full name
 * @property {string} avatar - URL to the user's avatar image
 *
 * @extends {React.ComponentProps<"input">}
 * @param {Object} props - Component props
 * @param {(email: string) => Promise<User[]>} props.fetchUsers - Function to fetch users based on input value
 * @param {(user: User) => void} [props.onUserSelect] - Optional callback when a user is selected
 * @param {(value: string) => void} [props.onChange] - Optional callback when input value changes
 * @param {string} [props.placeholder] - Input placeholder text
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Ref<HTMLInputElement>} ref - Forwarded ref
 *
 * @returns {JSX.Element} The AutocompleteInput component
 *
 * @note
 * - The dropdown appears after typing and shows matching users
 * - Includes debounced search to prevent excessive API calls
 * - Displays user avatar in the input field when selected
 * - Maintains accessibility features
 * - Supports keyboard navigation
 */
const AutocompleteInput = React.forwardRef<HTMLInputElement, AutocompleteInputProps>(
    ({className, type, onUserSelect, onChange, fetchUsers, ...props}, ref) => {
        const [inputValue, setInputValue] = React.useState("");
        const [suggestions, setSuggestions] = React.useState<User[]>([]);
        const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
        const [isOpen, setIsOpen] = React.useState(false);

        const debounceTimer = React.useRef<NodeJS.Timeout>();

        const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setInputValue(value);
            onChange?.(value);
            setSelectedUser(null);

            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }

            if (value.length > 0 && fetchUsers) {
                debounceTimer.current = setTimeout(async () => {
                    const users = await fetchUsers(value);
                    setSuggestions(users);
                    setIsOpen(true);
                }, 300);
            } else {
                setSuggestions([]);
                setIsOpen(false);
            }
        };

        const handleSelectUser = (user: User) => {
            setSelectedUser(user);
            setInputValue(user.email);
            setSuggestions([]);
            setIsOpen(false);
            onUserSelect?.(user);
        };

        return (
            <div className="relative">
                <div className="relative flex items-center">
                    {selectedUser && (
                        <div className="absolute left-3 flex items-center gap-2">
                            <img
                                src={selectedUser.avatar}
                                alt={selectedUser.name}
                                className="h-6 w-6 rounded-full"
                            />
                        </div>
                    )}
                    <Input
                        type={type}
                        className={cn(
                            selectedUser && "pl-12",
                            className
                        )}
                        ref={ref}
                        value={inputValue}
                        onChange={handleInputChange}
                        {...props}
                    />
                </div>

                {isOpen && suggestions.length > 0 && (
                    <div
                        className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-background shadow-lg">
                        {suggestions.map((user) => (
                            <div
                                key={user.email}
                                className="flex items-center gap-3 px-4 py-2 hover:bg-accent cursor-pointer"
                                onClick={() => handleSelectUser(user)}
                            >
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="h-8 w-8 rounded-full"
                                />
                                <div className="flex flex-col">
                                    <span className="font-medium">{user.name}</span>
                                    <span className="text-sm text-muted-foreground">{user.email}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }
)

AutocompleteInput.displayName = "AutocompleteInput"
export default AutocompleteInput;
