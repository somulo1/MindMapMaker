export type User = {
    id: number;
    username: string;
    email: string;
    name: string;
    avatar?: string;
}

export type UsernameOrEmail = {
    username?: string;
    email?: string;
};

// Query the API to get a user by email or username
async function fetchUser({username, email}: UsernameOrEmail): Promise<User | undefined> {
    if (!username && !email) {
        console.error('either username or email must be provided');
        return undefined;
    }

    const response = await fetch(`/api/users/search`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username, email}),
        });
    if (!response.ok) {
        return undefined;
    }
    return response.json();
}

export {fetchUser};
