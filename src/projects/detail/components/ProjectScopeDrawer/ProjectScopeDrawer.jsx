/**
 * ContentFooter component
 * used to be displayed in the right area of TwoColsLayout
 */
import React, { Component } from 'react'
import PT from 'prop-types'
import Drawer from 'appirio-tech-react-components/components/Drawer/Drawer'
import Toolbar from 'appirio-tech-react-components/components/Toolbar/Toolbar'
import ToolbarGroup from 'appirio-tech-react-components/components/Toolbar/ToolbarGroup'
import ToolbarTitle from 'appirio-tech-react-components/components/Toolbar/ToolbarTitle'
import CloseIcon from 'appirio-tech-react-components/components/Icons/CloseIcon'

import {
  PROJECT_ATTACHMENTS_FOLDER,
} from '../../../../config/constants'
import spinnerWhileLoading from '../../../../components/LoadingSpinner'
import EditProjectForm from '../../components/EditProjectForm'
import './ProjectScopeDrawer.scss'


// This handles showing a spinner while the state is being loaded async
const enhance = spinnerWhileLoading(props => !props.processing)
const EnhancedEditProjectForm = enhance(EditProjectForm)

class ProjectScopeDrawer extends Component {
  constructor(props) {
    super(props)
    this.saveProject = this.saveProject.bind(this)
    this.state = { project: {} }

    this.removeProjectAttachment = this.removeProjectAttachment.bind(this)
    this.updateProjectAttachment = this.updateProjectAttachment.bind(this)
    this.addProjectAttachment = this.addProjectAttachment.bind(this)
  }

  saveProject(model) {
    // compare old & new
    this.props.updateProject(this.props.project.id, model)
  }

  addProjectAttachment(attachment) {
    this.props.addProjectAttachment(this.props.project.id, attachment)
  }

  updateProjectAttachment(attachmentId, updatedAttachment) {
    this.props.updateProjectAttachment(this.props.project.id, attachmentId, updatedAttachment)
  }

  removeProjectAttachment(attachmentId) {
    this.props.removeProjectAttachment(this.props.project.id, attachmentId)
  }
 
  render() {
    const {
      project,
      projectTemplate,
      processing,
      fireProjectDirty,
      fireProjectDirtyUndo,
      isSuperUser,
      currentMemberRole,
      productTemplates,
      productCategories,
      onRequestChange,
    } = this.props

    const template = _.cloneDeep(projectTemplate.scope)

    const editPriv = isSuperUser ? isSuperUser : !!currentMemberRole
    const attachmentsStorePath = `${PROJECT_ATTACHMENTS_FOLDER}/${project.id}/`
    const projectTemplateScope = _.cloneDeep(_.get(projectTemplate, 'scope', {}))
    let haveEstimateQuestion = false
    haveEstimateQuestion = _.filter(_.get(projectTemplateScope, 'sections', []), {id: 'summary-final'}).length > 0

    if (haveEstimateQuestion) {
      template.wizard = null
      if (template.sections.length > 0) {
        const lastSection = template.sections[template.sections.length - 1]
        lastSection.nextButtonText = 'Save changes'
        _.forEach(template.sections, (section) => {
          section.hiddenOnEdit = false
        })
        lastSection.subSections.shift()
      }
    }
    

    return (
      <Drawer {...this.props}>
        <Toolbar style={{position: 'relative', zIndex: 3}}>
          <ToolbarGroup>
            <ToolbarTitle text="Project Scope" />
          </ToolbarGroup>
          <ToolbarGroup>
            <span styleName="close-btn" onClick={() => {onRequestChange(false)}}>
              <CloseIcon />
            </span>
          </ToolbarGroup>
        </Toolbar>
        <div styleName="drawer-content">
          {(
            <EnhancedEditProjectForm
              isInsideDrawer
              project={project}
              template={template}
              isEdittable={editPriv}
              submitHandler={this.saveProject}
              saving={processing}
              fireProjectDirty={fireProjectDirty}
              fireProjectDirtyUndo= {fireProjectDirtyUndo}
              addAttachment={this.addProjectAttachment}
              updateAttachment={this.updateProjectAttachment}
              removeAttachment={this.removeProjectAttachment}
              attachmentsStorePath={attachmentsStorePath}
              canManageAttachments={!!currentMemberRole}
              productTemplates={productTemplates}
              productCategories={productCategories}
              onlyShowSummary={haveEstimateQuestion}
              showHidden
            />
          )}
        </div>
      </Drawer>
    )
  }
}

ProjectScopeDrawer.defaultProps = {
}

ProjectScopeDrawer.propTypes = {
  className: PT.string, // The CSS class name of the root element.
  containerClassName: PT.string, // The CSS class name of the container element.
  containerStyle: PT.object, // Override the inline-styles of the container element.
  disableSwipeToOpen: PT.bool, // If true, swiping sideways when the `Drawer` is closed will not open it.
  docked: PT.bool, // If true, the `Drawer` will be docked. In this state, the overlay won't show and clicking on a menu item will not close the `Drawer`.
  onRequestChange: PT.func, // Callback function fired when the `open` state of the `Drawer` is requested to be changed.
  open: PT.bool, // If true, the `Drawer` is opened.  Providing a value will turn the `Drawer` into a controlled component.
  openSecondary: PT.bool, //  If true, the `Drawer` is positioned to open from the opposite side.
  overlayClassName: PT.string, // The CSS class name to add to the `Overlay` component that is rendered behind the `Drawer`.
  overlayStyle: PT.object, // Override the inline-styles of the `Overlay` component that is rendered behind the `Drawer`.
  style: PT.object, // Override the inline-styles of the root element.
  swipeAreaWidth: PT.number, // The width of the left most (or right most) area in pixels where the `Drawer` can be
  width: PT.oneOfType([
    PT.string,
    PT.number
  ]),
  zDepth: PT.number, // The zDepth of the `Drawer`.

  project: PT.object.isRequired,
  processing: PT.bool.isRequired,
  projectTemplate: PT.object.isRequired,
  productTemplates: PT.array.isRequired,
  productCategories: PT.array.isRequired,
  fireProjectDirty: PT.func.isRequired,
  fireProjectDirtyUndo: PT.func.isRequired,
  addProjectAttachment: PT.func.isRequired,
  updateProjectAttachment: PT.func.isRequired,
  removeProjectAttachment: PT.func.isRequired,
}

export default ProjectScopeDrawer
