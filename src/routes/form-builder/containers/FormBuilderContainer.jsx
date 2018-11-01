/**
 * Container component for notifications list with filter
 */
import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { connect } from 'react-redux'
import update from 'react-addons-update'
import ReactJson from 'react-json-view'
import FormsyForm from 'appirio-tech-react-components/components/Formsy'
const Formsy = FormsyForm.Formsy
import SelectDropdown from 'appirio-tech-react-components/components/SelectDropdown/SelectDropdown'
import Sticky from 'react-stickynode'
import SpecSection from '../../../projects/detail/components/SpecSection'
import { loadProjectsMetadata, getProductTemplate, saveProductTemplate } from '../../../actions/templates'
import FooterV2 from '../../../components/FooterV2/FooterV2'
import spinnerWhileLoading from '../../../components/LoadingSpinner'
import { requiresAuthentication } from '../../../components/AuthenticatedComponent'
import './FormBuilderContainer.scss'

class FormBuilderContainerView extends React.Component {
  constructor(props) {
    super(props)

    this.renderTemplate = this.renderTemplate.bind(this)
    this.renderSection = this.renderSection.bind(this)
    this.onJSONEdit = this.onJSONEdit.bind(this)
  }

  componentDidMount() {
    document.title = 'Form Builder - TopCoder'
    this.setState({ template: null, project: { details: { appDefinition: {} }, version: 'v2' }, dirtyProject: { details: {}, version: 'v2' } })
  }

  componentWillMount() {
    if (!this.props.templates || (!this.props.templates.productTemplates && !this.props.templates.isLoading)) {
      this.props.loadProjectsMetadata()
    }
  }

  renderTemplate(option) {
    const { templates } = this.props
    const selectedTemplate = _.find(templates.productTemplates, t => t.id === option.value)
    this.setState({ template: selectedTemplate })
  }

  onJSONEdit(updatedObj) {
    console.log(updatedObj)
    this.setState(update(this.state, {
      template: { template : { $set: updatedObj.updated_src } }
    }))
  }

  renderSection(section, idx) {
    // const anySectionInvalid = _.some(this.props.sections, (s) => s.isInvalid)
    return (
      <div key={idx}>
        <SpecSection
          {...section}
          project={this.state.project}
          dirtyProject={this.state.dirtyProject}
          isProjectDirty={this.state.isProjectDirty}
          sectionNumber={idx + 1}
          resetFeatures={ () => {} }
          showFeaturesDialog={() => {} }
          // TODO we shoudl not update the props (section is coming from props)
          validate={(isInvalid) => section.isInvalid = isInvalid}
          showHidden={false}
          addAttachment={ () => {} }
          updateAttachment={ () => {} }
          removeAttachment={ () => {} }
          attachmentsStorePath={'dummy'}
          canManageAttachments
        />
        <div className="section-footer section-footer-spec">
          <button className="tc-btn tc-btn-primary tc-btn-md" type="submit">Save Changes</button>
        </div>
      </div>
    )
  }

  render() {
    const { templates } = this.props
    if (!templates.productTemplates) {
      return (<div>Loading</div>)
    }
    const templateOptions = templates.productTemplates.map(t => ({ value: t.id, title: t.name }))
    return (
      <div className="form-builder-container">
        <div className="content">
          <SelectDropdown
            options={ templateOptions }
            onSelect={ this.renderTemplate }
            theme="default"
            // support passing selected value for the dropdown
          />
          { this.state.template && (
            <div>
              <ReactJson
                src={this.state.template.template}
                theme="rjv-default"
                onEdit={ this.onJSONEdit }
                collapsed={3}
                indentWidth={2}
                collapseStringsAfterLength={20}
              />
              {/* <textarea rows={50} name="template" value={JSON.stringify(this.state.template.template)} /> */}
            </div>
          )
          }
        </div>
        <aside className="filters">
          <Sticky top={90}>
            { this.state.template && (
              <div className="ProjectWizard">
                <div className="FillProjectDetails">
                  <Formsy.Form
                    ref="form"
                  >
                    {this.state.template.template.questions.map(this.renderSection)}
                  </Formsy.Form>
                </div>
              </div>
            )}
            <FooterV2 />
          </Sticky>
        </aside>
      </div>
    )
  }
}

const enhance = spinnerWhileLoading(props => !props.isLoading)
const FormBuilderContainerWithLoader = enhance(FormBuilderContainerView)
const FormBuilderContainerWithLoaderAndAuth = requiresAuthentication(FormBuilderContainerWithLoader)

FormBuilderContainerView.propTypes = {
  templates: PropTypes.object,
}


const mapStateToProps = ({ templates }) => ({
  templates
})

const mapDispatchToProps = {
  loadProjectsMetadata,
  getProductTemplate,
  saveProductTemplate
}

export default connect(mapStateToProps, mapDispatchToProps)(FormBuilderContainerWithLoaderAndAuth)
