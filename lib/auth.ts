import { signIn, signOut } from "../auth";

export const login = async (email: string, password: string) => {
    await signIn("credentials", {
        email,
        password,
        redirectTo: "/"
    });
}

export const logout = async () => {
    await signOut({ redirectTo: "/auth/signin" });
}