import type { SVGProps } from 'react'

export default function GridiconsGrid(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M8 8H4V4h4v4zm6-4h-4v4h4V4zm6 0h-4v4h4V4zM8 10H4v4h4v-4zm6 0h-4v4h4v-4zm6 0h-4v4h4v-4zM8 16H4v4h4v-4zm6 0h-4v4h4v-4zm6 0h-4v4h4v-4z"
      ></path>
    </svg>
  )
}
