'use client'
import { useState, useEffect } from 'react'
import { CategoryResponseDTO } from '@/types/category'

export interface CoursesFilterProps {
    categories: CategoryResponseDTO[]
    onFilterChange: (filters: {
        searchTerm: string
        selectedCategory: string | null
        selectedLevel: string | null
        priceFilter: string
        priceRange: [number, number]
    }) => void
}

const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']

export function CoursesFilter({ categories, onFilterChange }: CoursesFilterProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
    const [priceFilter, setPriceFilter] = useState('all')
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])

    useEffect(() => {
        onFilterChange({
            searchTerm,
            selectedCategory,
            selectedLevel,
            priceFilter,
            priceRange,
        })
        // eslint-disable-next-line
    }, [searchTerm, selectedCategory, selectedLevel, priceFilter, priceRange])

    return (
        <div className="flex flex-wrap gap-4 items-center mb-6">
            <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="border rounded px-3 py-2"
            />
            <select
                value={selectedCategory || ''}
                onChange={e => setSelectedCategory(e.target.value || null)}
                className="border rounded px-3 py-2"
            >
                <option value="">All Categories</option>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>
            <select
                value={selectedLevel || ''}
                onChange={e => setSelectedLevel(e.target.value || null)}
                className="border rounded px-3 py-2"
            >
                <option value="">All Levels</option>
                {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                ))}
            </select>
            <select
                value={priceFilter}
                onChange={e => setPriceFilter(e.target.value)}
                className="border rounded px-3 py-2"
            >
                <option value="all">All Prices</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
            </select>
            {/* Có thể thêm slider cho priceRange nếu muốn */}
        </div>
    )
} 