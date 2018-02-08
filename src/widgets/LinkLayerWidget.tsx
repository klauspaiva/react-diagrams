import * as React from "react";
import { DiagramEngine } from "../DiagramEngine";
import { LinkWidget } from "./LinkWidget";
import * as _ from "lodash";
import { PointModel } from "../models/PointModel";

export interface LinkLayerProps {
	diagramEngine: DiagramEngine;
	pointAdded: (point: PointModel, event: MouseEvent) => any;
}

export interface LinkLayerState {}

/**
 * @author Dylan Vorster
 */
export class LinkLayerWidget extends React.Component<LinkLayerProps, LinkLayerState> {
	constructor(props: LinkLayerProps) {
		super(props);
		this.state = {};
	}

	render() {
		var diagramModel = this.props.diagramEngine.getDiagramModel();
		return (
			<svg
				style={{
					transform:
						"translate(" +
						diagramModel.getOffsetX() +
						"px," +
						diagramModel.getOffsetY() +
						"px) scale(" +
						diagramModel.getZoomLevel() / 100.0 +
						")",
					width: "100%",
					height: "100%"
				}}
			>
				{/* TODO: only for testing */}
				<defs>
					<marker id="arrow" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto" markerUnits="strokeWidth">
						<path d="M0,2 L0,4 L4,2 L0,0 Z" fill="#CCC" />
					</marker>
				</defs>

				{//only perform these actions when we have a diagram
				this.props.diagramEngine.canvas &&
					_.map(diagramModel.getLinks(), link => {
						if (
							this.props.diagramEngine.nodesRendered &&
							!this.props.diagramEngine.linksThatHaveInitiallyRendered[link.id]
						) {
							if (link.sourcePort !== null) {
								try {
									// TODO: review this
									link.points[0].updateLocation(
										this.props.diagramEngine.getPortCenter(link.sourcePort)
									);
									link.sourcePort.updateCoords(
										this.props.diagramEngine.getPortCoords(link.sourcePort)
									);
									this.props.diagramEngine.linksThatHaveInitiallyRendered[link.id] = true;
								} catch (ex) {}
							}
							if (link.targetPort !== null) {
								try {
									_.last(link.points).updateLocation(
										this.props.diagramEngine.getPortCenter(link.targetPort)
									);
									link.targetPort.updateCoords(
										this.props.diagramEngine.getPortCoords(link.targetPort)
									);
									this.props.diagramEngine.linksThatHaveInitiallyRendered[link.id] = true;
								} catch (ex) {}
							}
						}

						//generate links
						var generatedLink = this.props.diagramEngine.generateWidgetForLink(link);
						if (!generatedLink) {
							console.log("no link generated for type: " + link.getType());
							return null;
						}

						return (
							<LinkWidget key={link.getID()} link={link} diagramEngine={this.props.diagramEngine}>
								{React.cloneElement(generatedLink, {
									pointAdded: this.props.pointAdded
								})}
							</LinkWidget>
						);
					})}
			</svg>
		);
	}
}
