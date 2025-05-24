import { IStudent } from "@/database/schema";
import { Controller } from "@/decorators/controller";
import { Roles } from "@/decorators/roles";
import { Get, Post } from "@/decorators/routes";
import { dependencyTokens } from "@/dependencies/tokens";
import { IAuthService, IStudentService } from "@/services";
import { IStudentSearchEntry, ITimetable, UserRole } from "@/types";
import { validateAcademicSession, validateSemester } from "@/utils";
import { Request, Response } from "express";
import { inject } from "tsyringe";
import { IStudentController } from "./IStudentController";

/**
 * A controller that is responsible for handling student-related operations.
 */
@Controller("/student")
export class StudentController implements IStudentController {
    constructor(
        @inject(dependencyTokens.studentService)
        private readonly studentService: IStudentService,
        @inject(dependencyTokens.authService)
        private readonly authService: IAuthService
    ) {}

    @Post("/login")
    async login(
        req: Request<
            "/login",
            unknown,
            Partial<{ login: string; password: string }>
        >,
        res: Response<IStudent | { error: string }>
    ) {
        const { login, password } = req.body;

        if (!login || !password) {
            res.status(400).json({ error: "Login and password are required" });

            return;
        }

        try {
            const student = await this.studentService.getByMatricNo(login);

            if (student?.kpNo !== password) {
                res.status(401).json({ error: "Invalid username or password" });

                return;
            }

            this.authService.createSession(res, student);

            res.json(student);
        } catch (e) {
            console.error(e);

            res.status(500).json({ error: "Internal server error" });
        }
    }

    @Post("/logout")
    @Roles(UserRole.student)
    logout(_: Request<"/logout">, res: Response) {
        this.authService.clearSession(res);

        res.sendStatus(200);
    }

    @Get("/timetable")
    @Roles(UserRole.student, UserRole.lecturer)
    async getTimetable(
        req: Request<
            "/timetable",
            unknown,
            unknown,
            Partial<{ session: string; semester: string; matric_no: string }>
        >,
        res: Response<ITimetable[] | { error: string }>
    ) {
        const { session, semester, matric_no: matricNo } = req.query;

        if (!session) {
            res.status(400).json({ error: "Academic session is required." });

            return;
        }

        if (!semester) {
            res.status(400).json({ error: "Semester is required." });

            return;
        }

        if (!matricNo) {
            res.status(400).json({ error: "Matric number is required." });

            return;
        }

        if (!validateAcademicSession(session)) {
            res.status(400).json({
                error: "Invalid session format. Expected format: YYYY/YYYY.",
            });

            return;
        }

        const parsedSemester = parseInt(semester);

        if (!validateSemester(parsedSemester)) {
            res.status(400).json({
                error: "Invalid semester format. Expected format: 1, 2, or 3.",
            });

            return;
        }

        try {
            const result = await this.studentService.getTimetable(
                matricNo,
                session,
                parsedSemester
            );

            if (result.isSuccessful()) {
                res.json(result.data);
            } else if (result.failed()) {
                res.status(result.status).json({ error: result.error });
            }
        } catch (e) {
            console.error(e);

            res.status(500).json({ error: "Internal server error" });
        }
    }

    @Get("/search")
    @Roles(UserRole.student, UserRole.lecturer)
    async search(
        req: Request<"/search", unknown, unknown, Partial<{ query: string }>>,
        res: Response<IStudentSearchEntry[] | { error: string }>
    ) {
        const { query } = req.query;

        if (!query) {
            res.status(400).json({ error: "Query is required" });

            return;
        }

        try {
            const result = await this.studentService.search(query);

            if (result.failed()) {
                res.status(result.status).json({ error: result.error });

                return;
            }

            res.json(result.isSuccessful() ? result.data : []);
        } catch (e) {
            console.error(e);

            res.status(500).json({ error: "Internal server error" });
        }
    }

    @Get("/validate-session")
    @Roles(UserRole.student)
    validateSession(req: Request, res: Response<IStudent | { error: string }>) {
        if (!req.student) {
            res.status(401).json({ error: "Not authenticated" });
            return;
        }

        res.json(req.student);
    }
}
