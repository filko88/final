import type { NextResponse } from "next/server"

// In-memory fixed-window rate limiter keyed by provided key (e.g., ip:route)
// Suitable for single-instance/serverless dev. For production, replace with Redis.

type Bucket = {
	count: number
	resetAt: number
}

export type RateLimitInfo = {
	allowed: boolean
	limit: number
	remaining: number
	resetAt: number
}

const buckets = new Map<string, Bucket>()

function now(): number {
	return Date.now()
}

export function extractClientIp(request: Request): string {
	const xfwd = request.headers.get("x-forwarded-for") || ""
	if (xfwd) {
		const ip = xfwd.split(",")[0]?.trim()
		if (ip) return ip
	}
	const realIp = request.headers.get("x-real-ip")
	if (realIp) return realIp
	return "127.0.0.1"
}

export function extractClientIpFromHeaders(headers: Headers): string {
	const xfwd = headers.get("x-forwarded-for") || ""
	if (xfwd) {
		const ip = xfwd.split(",")[0]?.trim()
		if (ip) return ip
	}
	const realIp = headers.get("x-real-ip")
	if (realIp) return realIp
	return "127.0.0.1"
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitInfo {
	const t = now()
	const bucket = buckets.get(key)
	if (!bucket || t >= bucket.resetAt) {
		buckets.set(key, { count: 1, resetAt: t + windowMs })
		return { allowed: true, limit, remaining: Math.max(0, limit - 1), resetAt: t + windowMs }
	}
	bucket.count += 1
	const allowed = bucket.count <= limit
	const remaining = Math.max(0, limit - bucket.count)
	return { allowed, limit, remaining, resetAt: bucket.resetAt }
}

export function rateLimitByIp(request: Request, routeKey: string, limit: number, windowMs: number): RateLimitInfo {
	const ip = extractClientIp(request)
	const key = `${routeKey}:${ip}`
	return rateLimit(key, limit, windowMs)
}

export function rateLimitByHeaders(headers: Headers, routeKey: string, limit: number, windowMs: number): RateLimitInfo {
	const ip = extractClientIpFromHeaders(headers)
	const key = `${routeKey}:${ip}`
	return rateLimit(key, limit, windowMs)
}

export function rateLimitHeaders(info: RateLimitInfo): Record<string, string> {
	return {
		"X-RateLimit-Limit": String(info.limit),
		"X-RateLimit-Remaining": String(info.remaining),
		"X-RateLimit-Reset": String(Math.floor(info.resetAt / 1000)),
	}
}
