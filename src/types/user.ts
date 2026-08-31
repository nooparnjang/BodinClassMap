export interface User {
    uid: string;
    email: string;
    name: string;
    studentId: string;
    role: "student" | "admin";
}