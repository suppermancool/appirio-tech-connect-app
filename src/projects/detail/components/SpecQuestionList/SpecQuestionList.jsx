import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import _ from 'lodash'
require('./SpecQuestionList.scss')

const SpecQuestionList = ({ children, layout, additionalClass }) => {
  let layoutClass = ''
  if (layout) {
    const direction = _.get(layout, 'direction', '')
    if (direction) {
      layoutClass += ('direction-' + direction + ' ')
    }
  }
  return (
    <div className={'spec-question-list ' + layoutClass + ' ' + additionalClass}>
      { children }
    </div>
  )
}

SpecQuestionList.propTypes = {
  children: PropTypes.any.isRequired,
  /**
   * Layout of questions
   */
  layout: PropTypes.object,

  /**
   * additional class
   */
  additionalClass: PropTypes.string
}

SpecQuestionList.defaultProps = {
  additionalClass: ''
}

const SpecQuestionListItem = ({icon, title, type, description, children, required, hideDescription}) => (
  <div className="spec-question-list-item">
    {icon && <div className="icon-col">{icon}</div>}
    <div className="content-col">
      <h5>{title}{required ? <span>*</span> : null}</h5>
      {children && <div className="child-component">{children}</div>}
      {!hideDescription && <p className={cn({bigger: !icon})}>{description}</p>}
      {(type === 'textinput') &&
      <div className="refcode-desc">{required ? 'Required' : 'Optional'}</div>}
    </div>
  </div>
)

SpecQuestionListItem.propTypes = {
  icon: PropTypes.any,
  title: PropTypes.any.isRequired,
  description: PropTypes.any,
  children: PropTypes.any,
  type: PropTypes.string
}

SpecQuestionList.Item = SpecQuestionListItem

export default SpecQuestionList
