/**
 * DashboardContainer container
 * displays content of the Dashboard tab
 *
 * NOTE data is loaded by the parent ProjectDetail component
 */
import React from 'react'
import _ from 'lodash'
import { connect } from 'react-redux'

import {
  filterReadNotifications,
  filterNotificationsByProjectId,
  filterProjectNotifications,
  preRenderNotifications,
} from '../../../routes/notifications/helpers/notifications'
import { toggleNotificationRead, toggleBundledNotificationRead } from '../../../routes/notifications/actions'
import {
  updateProduct,
  fireProductDirty,
  fireProductDirtyUndo,
  deleteProjectPhase,
  expandProjectPhase,
  collapseProjectPhase,
  collapseAllProjectPhases,
} from '../../actions/project'
import { addProductAttachment, updateProductAttachment, removeProductAttachment } from '../../actions/projectAttachment'

import MediaQuery from 'react-responsive'
import ProjectInfoContainer from './ProjectInfoContainer'
import FeedContainer from './FeedContainer'
import Sticky from '../../../components/Sticky'
import { SCREEN_BREAKPOINT_MD } from '../../../config/constants'
import TwoColsLayout from '../../../components/TwoColsLayout'
import SystemFeed from '../../../components/Feed/SystemFeed'
import WorkInProgress from '../components/WorkInProgress'
import ProjectEstimation from '../../create/components/ProjectEstimation'
import NotificationsReader from '../../../components/NotificationsReader'
import { checkPermission } from '../../../helpers/permissions'
import PERMISSIONS from '../../../config/permissions'

import {
  PHASE_STATUS_ACTIVE,
  CODER_BOT_USER_FNAME,
  CODER_BOT_USER_LNAME,
  PROJECT_FEED_TYPE_PRIMARY,
  PROJECT_FEED_TYPE_MESSAGES,
  EVENT_TYPE,
} from '../../../config/constants'

import Drawer from 'appirio-tech-react-components/components/Drawer/Drawer'
import Toolbar from 'appirio-tech-react-components/components/Toolbar/Toolbar'
import ToolbarGroup from 'appirio-tech-react-components/components/Toolbar/ToolbarGroup'
import ToolbarTitle from 'appirio-tech-react-components/components/Toolbar/ToolbarTitle'
import CloseIcon from 'appirio-tech-react-components/components/Icons/CloseIcon'
import './DashboardContainer.scss'

const SYSTEM_USER = {
  firstName: CODER_BOT_USER_FNAME,
  lastName: CODER_BOT_USER_LNAME,
  photoURL: require('../../../assets/images/avatar-coder.svg')
}

class DashboardContainer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      open: false
    }
    this.onNotificationRead = this.onNotificationRead.bind(this)
    this.toggleDrawer = this.toggleDrawer.bind(this)
  }

  onNotificationRead(notification) {
    if (notification.bundledIds) {
      this.props.toggleBundledNotificationRead(notification.id, notification.bundledIds)
    } else {
      this.props.toggleNotificationRead(notification.id)
    }
  }

  componentDidMount() {
    // if the user is a customer and its not a direct link to a particular phase
    // then by default expand all phases which are active
    const { isCustomerUser, expandProjectPhase } = this.props

    if (isCustomerUser) {
      _.forEach(this.props.phases, phase => {
        if (phase.status === PHASE_STATUS_ACTIVE) {
          expandProjectPhase(phase.id)
        }
      })
    }
  }

  componentWillUnmount() {
    const { collapseAllProjectPhases } = this.props

    collapseAllProjectPhases()
  }

  toggleDrawer() {
    this.setState((prevState) => ({
      open: !prevState.open
    }))
  }

  render() {
    const {
      project,
      phases,
      currentMemberRole,
      isSuperUser,
      isManageUser,
      notifications,
      productTemplates,
      projectTemplates,
      isProcessing,
      updateProduct,
      fireProductDirty,
      fireProductDirtyUndo,
      addProductAttachment,
      updateProductAttachment,
      removeProductAttachment,
      deleteProjectPhase,
      feeds,
      isFeedsLoading,
      productsTimelines,
      phasesStates,
      phasesTopics,
      expandProjectPhase,
      collapseProjectPhase,
    } = this.props

    const projectTemplate = _.find(projectTemplates, t => t.id === project.templateId)
    const projectTemplateScope = _.get(projectTemplate, 'scope', {})
    const hasEstimation = true
    let question
    if (hasEstimation) {
      _.forEach(_.get(projectTemplateScope, 'sections', []), (section) => {
        const subSections = _.filter(_.get(section, 'subSections', []), {type: 'questions'})
        _.forEach(subSections, (subSection) => {
          const questionTmp = _.filter(_.get(subSection, 'questions', []), {type: 'estimation'})
          if (questionTmp.length > 0) {
            question = questionTmp[0]
            return false
          }
        })
        if (question) {
          return false
        }
      })
    }


    // system notifications
    const notReadNotifications = filterReadNotifications(notifications)
    const unreadProjectUpdate = filterProjectNotifications(filterNotificationsByProjectId(notReadNotifications, project.id))
    const sortedUnreadProjectUpdates = _.orderBy(unreadProjectUpdate, ['date'], ['desc'])

    // work in progress phases
    // find active phases
    const activePhases = _.orderBy(_.filter(phases, phase => phase.status === PHASE_STATUS_ACTIVE), ['endDate'])

    const leftArea = (
      <ProjectInfoContainer
        currentMemberRole={currentMemberRole}
        project={project}
        phases={phases}
        isSuperUser={isSuperUser}
        isManageUser={isManageUser}
        feeds={feeds}
        isFeedsLoading={isFeedsLoading}
        productsTimelines={productsTimelines}
        phasesTopics={phasesTopics}
        isProjectProcessing={isProcessing}
      />
    )

    return (
      <TwoColsLayout>
        <NotificationsReader 
          id="dashboard"
          criteria={[
            { eventType: EVENT_TYPE.PROJECT.ACTIVE, contents: { projectId: project.id } }, 
            { eventType: EVENT_TYPE.MEMBER.JOINED, contents: { projectId: project.id } }, 
            { eventType: EVENT_TYPE.MEMBER.LEFT, contents: { projectId: project.id } }, 
            { eventType: EVENT_TYPE.MEMBER.REMOVED, contents: { projectId: project.id } }, 
            { eventType: EVENT_TYPE.MEMBER.ASSIGNED_AS_OWNER, contents: { projectId: project.id } }, 
            { eventType: EVENT_TYPE.MEMBER.COPILOT_JOINED, contents: { projectId: project.id } }, 
            { eventType: EVENT_TYPE.MEMBER.MANAGER_JOINED, contents: { projectId: project.id } }, 
          ]}
        />

        <TwoColsLayout.Sidebar>
          <MediaQuery minWidth={SCREEN_BREAKPOINT_MD}>
            {(matches) => {
              if (matches) {
                return <Sticky top={110}>{leftArea}</Sticky>
              } else {
                return leftArea
              }
            }}
          </MediaQuery>
        </TwoColsLayout.Sidebar>

        <TwoColsLayout.Content>
          {unreadProjectUpdate.length > 0 &&
            <SystemFeed
              messages={sortedUnreadProjectUpdates}
              user={SYSTEM_USER}
              onNotificationRead={this.onNotificationRead}
            />
          }
          <button type="button" onClick={this.toggleDrawer}>Toggle drawer</button>
          {/* The following containerStyle and overlayStyle are needed for shrink drawer and overlay size for not
              covering sidebar and topbar
           */}
          <Drawer
            open={this.state.open}
            containerStyle={{top: '110px'}}
            overlayStyle={{top: '110px', left: '360px'}}
            onRequestChange={(open) => this.setState({open})}
          >
            <Toolbar>
              <ToolbarGroup>
                <ToolbarTitle text="Project Scope" />
              </ToolbarGroup>
              <ToolbarGroup>
                <span styleName="close-btn" onClick={() => this.setState({open: false})}>
                  <CloseIcon />
                </span>
              </ToolbarGroup>
            </Toolbar>
            <div styleName="drawer-content">
              test content
            </div>
          </Drawer>

          {question && (<ProjectEstimation question={question} project={project} template={projectTemplateScope} hidePriceEstimate />)}

          {activePhases.length > 0 &&
            <WorkInProgress
              productTemplates={productTemplates}
              currentMemberRole={currentMemberRole}
              isProcessing={isProcessing}
              isSuperUser={isSuperUser}
              isManageUser={isManageUser}
              project={project}
              activePhases={activePhases}
              updateProduct={updateProduct}
              fireProductDirty={fireProductDirty}
              fireProductDirtyUndo={fireProductDirtyUndo}
              addProductAttachment={addProductAttachment}
              updateProductAttachment={updateProductAttachment}
              removeProductAttachment={removeProductAttachment}
              deleteProjectPhase={deleteProjectPhase}
              phasesStates={phasesStates}
              expandProjectPhase={expandProjectPhase}
              collapseProjectPhase={collapseProjectPhase}
            />
          }

          <FeedContainer
            currentMemberRole={currentMemberRole}
            project={project}
            isSuperUser={isSuperUser}
          />
        </TwoColsLayout.Content>
      </TwoColsLayout>
    )
  }
}

const mapStateToProps = ({ notifications, projectState, projectTopics, templates, phasesTopics }) => {
  // all feeds includes primary as well as private topics if user has access to private topics
  let allFeed = projectTopics.feeds[PROJECT_FEED_TYPE_PRIMARY].topics
  if (checkPermission(PERMISSIONS.ACCESS_PRIVATE_POST)) {
    allFeed = [...allFeed, ...projectTopics.feeds[PROJECT_FEED_TYPE_MESSAGES].topics]
  }

  return {
    notifications: preRenderNotifications(notifications.notifications),
    productTemplates: templates.productTemplates,
    projectTemplates: templates.projectTemplates,
    isProcessing: projectState.processing,
    phases: projectState.phases,
    feeds: allFeed,
    isFeedsLoading: projectTopics.isLoading,
    phasesStates: projectState.phasesStates,
    phasesTopics,
  }
}

const mapDispatchToProps = {
  toggleNotificationRead,
  toggleBundledNotificationRead,
  updateProduct,
  fireProductDirty,
  fireProductDirtyUndo,
  addProductAttachment,
  updateProductAttachment,
  removeProductAttachment,
  deleteProjectPhase,
  expandProjectPhase,
  collapseProjectPhase,
  collapseAllProjectPhases,
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardContainer)
