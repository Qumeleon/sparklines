import { SparkLines } from '../SparkLines'

export abstract class SparkLine {
  protected graph!: SparkLines

  /**
   * Render the SparkLine. This returns an element you can add to your HTML.
   *
   * @return An HTML element containing the sparklines
   */
  render() {
    return this.graph.render()
  }
}
