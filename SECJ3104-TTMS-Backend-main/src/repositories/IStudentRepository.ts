import { IStudent } from "@/database/schema";
import { ITimetable, TTMSSemester, TTMSSession } from "@/types";

/**
 * A repository that is responsible for handling student-related operations.
 */
export interface IStudentRepository {
    /**
     * Obtains a student by their matric number.
     *
     * @param matricNo The matric number of the student.
     * @returns The student with the given matric number, or `null` if not found.
     */
    getByMatricNo(matricNo: string): Promise<IStudent | null>;

    /**
     * Obtains the timetable of a student.
     *
     * @param matricNo The matric number of the student.
     * @param session The academic session to obtain the timetable for.
     * @param semester The academic semester to obtain the timetable for.
     * @returns The timetable of the student.
     */
    getTimetable(
        matricNo: string,
        session: TTMSSession,
        semester: TTMSSemester
    ): Promise<ITimetable[]>;

    /**
     * Searches students by their matric number.
     *
     * This uses a full-text search to find students whose matric numbers match the given matric number.
     *
     * @param matricNo The matric number to search.
     * @param limit The maximum number of students to return. Defaults to 10.
     * @param offset The number of students to skip before starting to collect the result set. Defaults to 0.
     * @returns The students whose matric numbers match the given matric number.
     */
    searchByMatricNo(
        matricNo: string,
        limit?: number,
        offset?: number
    ): Promise<IStudent[]>;

    /**
     * Searches students by their name.
     *
     * This uses a full-text search to find students whose names match the given name.
     *
     * @param name The name to search.
     * @param limit The maximum number of students to return. Defaults to 10.
     * @param offset The number of students to skip before starting to collect the result set. Defaults to 0.
     * @returns The students whose names match the given name.
     */
    searchByName(
        name: string,
        limit?: number,
        offset?: number
    ): Promise<IStudent[]>;
}
