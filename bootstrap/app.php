<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->redirectGuestsTo(function (Request $request) {
            if ($request->is('hrd*')) {
                if (auth('pelamar')->check()) {
                    session()->flash('error', 'Anda tidak memiliki hak akses!');
                    return route('landing');
                }
                return route('hrd.auth.showLogin');
            }

            if ($request->is('pelamar*')) {
                if (auth('hrd')->check()) {
                    session()->flash('error', 'Anda tidak memiliki hak akses!');
                    return route('landing');
                }
                return route('pelamar.auth.showLogin');
            }

            return route('login');
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
