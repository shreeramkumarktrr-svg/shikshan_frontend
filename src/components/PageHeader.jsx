import ResponsiveCard from './ResponsiveCard'
import { FormButton } from './ResponsiveForm'

function PageHeader({ 
  title, 
  subtitle, 
  actions = [], 
  className = "",
  showCard = true 
}) {
  const content = (
    <div className="page-header">
      <div className="page-header-content">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
      </div>
      
      {actions.length > 0 && (
        <div className="page-header-actions">
          {actions.map((action, index) => (
            <FormButton
              key={index}
              variant={action.variant || 'primary'}
              onClick={action.onClick}
              size={action.size || 'default'}
              className={`btn-no-shrink ${action.primary ? 'btn-primary-mobile' : 'btn-secondary-mobile'} ${action.className || ''}`}
              disabled={action.disabled}
            >
              {action.icon && (
                <span className="mr-2 flex-shrink-0">
                  {action.icon}
                </span>
              )}
              <span className="truncate">{action.label}</span>
            </FormButton>
          ))}
        </div>
      )}
    </div>
  )

  if (showCard) {
    return (
      <ResponsiveCard className={`mb-6 ${className}`}>
        {content}
      </ResponsiveCard>
    )
  }

  return (
    <div className={`mb-6 ${className}`}>
      {content}
    </div>
  )
}

export default PageHeader