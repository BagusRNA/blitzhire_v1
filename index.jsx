import React from 'react';
import { head, link } from '@inertiajs/react';


export default function JobBoard ({ jobs }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <head title="Forum Job - BlitzHire" />

                <nav className="bg-white px-8 py-4 flex justify-between items-center shadow-sm border-b">
                    <h1 className="text-2xl font-black text-blue-700 tracking-tight">BlitzHire</h1>
                    <div className="space-x-4">
                       <link href="/login" className="text-gray-600 font-medium hover:text-blue-600">Login</link>
                       <link href="/register" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition">Register</link> 
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto py-12 px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Discover Your Next Role</h2>
                        <p className="mt-4 text-lg text-gray-500">Browse open positions and find where you belong.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs?.length > 0 ? (
                        jobs.map((job) => (
                            <div key={job.id_lowongan} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-xl font-bold text-gray-900">{job.judul_lowongan || job.posisi}</h3>
                                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                        {job.tipe_pekerjaan}
                                    </span>
                                </div>
                                <p className="text-gray-600 font-medium text-sm mb-4">📍 {job.lokasi}{job.departemen ? ` • ${job.departemen}` : ''}</p>
                                <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-grow">{job.deskripsi}</p>
                                
                                <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                                    <span className="text-sm font-bold text-gray-900">
                                        {Number(job.gaji_min) > 0 ? `Rp ${Number(job.gaji_min).toLocaleString('id-ID')}` : 'Kompetitif'}
                                    </span>
                                    <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                                        Apply Now
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
                            No active job postings right now. Please check back later.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}