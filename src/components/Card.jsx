export default function Card({ className = '', children, ...props }) {
  return <section className={`rounded-card bg-white p-5 shadow-card ${className}`} {...props}>{children}</section>
}
