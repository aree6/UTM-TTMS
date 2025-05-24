import { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { ILecturer, IStudent } from "../../src/database/schema";
import { AuthService } from "../../src/services";
import { UserRole } from "../../src/types";
import { encrypt } from "../../src/utils";

describe("AuthService (unit)", () => {
    const authService = new AuthService();

    const mockResponse = {
        cookie: vi.fn(),
        clearCookie: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    } as unknown as Response;

    it("Should create a session cookie", () => {
        authService.createSession(mockResponse, { test: "test" });

        expect(mockResponse.cookie).toHaveBeenCalledWith(
            "session",
            expect.any(String),
            {
                httpOnly: true,
                signed: true,
                secure: false,
                sameSite: "strict",
                maxAge: 3600000,
            }
        );
    });

    it("Should clear a session cookie", () => {
        authService.clearSession(mockResponse);

        expect(mockResponse.clearCookie).toHaveBeenCalledWith("session");
    });

    describe("Session verification", () => {
        const next = vi.fn();

        it("Should return 401 if no session cookie is present", async () => {
            const mockRequest = {
                signedCookies: {},
            } as unknown as Request;

            await authService.verifySession()(mockRequest, mockResponse, next);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: "Unauthorized",
            });
            expect(next).not.toHaveBeenCalled();
        });

        it("Should return 401 and clear session if session cookie is invalid", async () => {
            const mockRequest = {
                signedCookies: { session: "invalid" },
            } as unknown as Request;

            await authService.verifySession()(mockRequest, mockResponse, next);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: "Unauthorized",
            });
            expect(next).not.toHaveBeenCalled();
            expect(mockResponse.clearCookie).toHaveBeenCalledWith("session");
        });

        it("Should return 403 if user role is not allowed", async () => {
            const mockRequest = {
                signedCookies: {
                    session: encrypt(
                        JSON.stringify({
                            name: "Test student",
                            courseCode: "Test course",
                            facultyCode: "Test faculty",
                            matricNo: "Test matric",
                            kpNo: "Test kp",
                        } satisfies IStudent)
                    ),
                },
            } as unknown as Request;

            await authService.verifySession(UserRole.lecturer)(
                mockRequest,
                mockResponse,
                next
            );

            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: "Forbidden",
            });
            expect(next).not.toHaveBeenCalled();
        });

        it("Should call next if user is authenticated and no role is specified", async () => {
            const mockRequest = {
                signedCookies: {
                    session: encrypt(
                        JSON.stringify({
                            name: "Test student",
                            courseCode: "Test course",
                            facultyCode: "Test faculty",
                            matricNo: "Test matric",
                            kpNo: "Test kp",
                        } satisfies IStudent)
                    ),
                },
            } as unknown as Request;

            await authService.verifySession()(mockRequest, mockResponse, next);

            expect(next).toHaveBeenCalled();
        });

        it("Should call next if user role is allowed", async () => {
            const mockRequest = {
                signedCookies: {
                    session: encrypt(
                        JSON.stringify({
                            name: "Test lecturer",
                            workerNo: 19391378,
                        } satisfies ILecturer)
                    ),
                },
            } as unknown as Request;

            await authService.verifySession(UserRole.lecturer)(
                mockRequest,
                mockResponse,
                next
            );

            expect(next).toHaveBeenCalled();
        });
    });
});
